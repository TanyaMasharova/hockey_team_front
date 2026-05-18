'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Paper,
} from '@mui/material';
import GridLegacy from '@mui/material/GridLegacy';
import {
  getMatchById,
  getStadiumSectors,
  getSeatsBySector,
  type Match,
  type Sector,
  type Seat,
} from '@/shared/api/matches';
import { createTicket } from '@/shared/api/ticket';
import { useError } from '@/shared/context/ErrorContext';
import MatchInfo from './components/MatchInfo';
import SectorSelector from './components/SectorSelector';
import SeatSelector from './components/SeatSelector';
import TicketSummary from './components/TicketSummary';
import PurchaseForm from './components/PurchaseForm';
import styles from './page.module.css';
import { getUserById } from '@/shared/api/user';

const steps = ['Выбор сектора', 'Выбор места', 'Ваши данные', 'Подтверждение'];

export default function PurchaseTicketPage() {
  const params = useParams();
  const router = useRouter();
  const { setError } = useError();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  const [match, setMatch] = useState<Match | null>(null);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [formData, setFormData] = useState({
    email: '',
  });

  useEffect(() => {
    const matchId = params?.id as string;
    if (matchId) {
      fetchData(matchId);
    } else {
      console.error('No match ID in params');
      setLoading(false);
      setError('Матч не найден');
    }
  }, [params?.id]);

  const fetchData = async (matchId: string) => {
    try {
      setLoading(true);
      console.log('Fetching data for match:', matchId);

      const [matchData, sectorsData] = await Promise.all([
        getMatchById(matchId),
        getStadiumSectors(),
      ]);

      console.log('Match loaded:', matchData);
      console.log('Sectors loaded:', sectorsData?.length);

      setMatch(matchData);
      setSectors(sectorsData || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  const handleSectorSelect = async (sector: Sector) => {
    setSelectedSector(sector);
    try {
      console.log('Loading seats for sector:', sector.id);
      console.log('Match ID:', match?.id); // Проверьте, есть ли match.id

      // console.log(match)
      const seatsData = await getSeatsBySector(sector.id, match!.id);
      console.log('Seats loaded:', seatsData);

      setSeats(seatsData || []);
      setActiveStep(1);
    } catch (error) {
      console.error('Failed to load seats:', error);
      setError('Не удалось загрузить места');
    }
  };

  const handleSeatSelect = (seat: Seat) => {
    setSelectedSeat(seat);
    setActiveStep(2);
  };

  const handleFormSubmit = (data: typeof formData) => {
    setFormData(data);
    setActiveStep(3);
  };
  const handlePurchase = async () => {
    if (!match || !selectedSector || !selectedSeat) return;

    setPurchasing(true);
    try {
      const userId = localStorage.getItem('user');
      if (!userId) {
        setError('Необходимо авторизоваться');
        router.push('/login');
        return;
      }

      const price = calculatePrice();

      // Проверяем, что selectedSeat.ID существует
      if (!selectedSeat.ID) {
        console.error('No seat ID:', selectedSeat);
        setError('Ошибка: не выбран билет');
        return;
      }

      const ticketData = {
        user_id: userId,
        match_id: match.id,
        seat_id: selectedSeat.ID, // ← используем ID с большой буквы
        final_price: price,
      };

      console.log('Creating ticket with data:', ticketData);

      await createTicket(ticketData);

      router.push('/user');
    } catch (error: any) {
      console.error('Purchase failed:', error);
      setError(error.message || 'Ошибка при покупке билета');
    } finally {
      setPurchasing(false);
    }
  };

  const calculatePrice = () => {
    if (!match || !selectedSector) return 0;
    const basePrice = 1000;
    const coefficient = selectedSector.price_coefficient;
    let finalPrice = basePrice * coefficient;

    if (match.is_derby) finalPrice *= 1.5;
    return Math.round(finalPrice);
  };

  const handleBack = () => {
    if (activeStep === 1) {
      setSelectedSector(null);
      setSelectedSeat(null);
    }
    if (activeStep === 2) {
      setSelectedSeat(null);
    }
    setActiveStep(prev => prev - 1);
  };

  if (loading) {
    return (
      <Container className={styles.loadingContainer}>
        <CircularProgress />
        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
          Загрузка данных...
        </Typography>
      </Container>
    );
  }

  if (!match) {
    return (
      <Container className={styles.errorContainer}>
        <Alert severity="error">Матч не найден</Alert>
      </Container>
    );
  }

  const price = calculatePrice();

  return (
    <Container className={styles.container}>
      <Paper className={styles.paper}>
        <Typography variant="h4" className={styles.title}>
          Покупка билета
        </Typography>

        <Stepper activeStep={activeStep} className={styles.stepper}>
          {steps.map(label => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <GridLegacy container spacing={4}>
          <GridLegacy item xs={12} md={7}>
            {activeStep === 0 && (
              <SectorSelector
                sectors={sectors}
                selectedSector={selectedSector}
                onSelect={handleSectorSelect}
              />
            )}

            {activeStep === 1 && selectedSector && (
              <SeatSelector
                seats={seats}
                selectedSeat={selectedSeat}
                onSelect={handleSeatSelect}
                sector={selectedSector}
                onBack={() => setActiveStep(0)}
              />
            )}

            {activeStep === 2 && (
              <PurchaseForm
                initialData={formData}
                onSubmit={handleFormSubmit}
                onBack={() => setActiveStep(1)}
              />
            )}

            {activeStep === 3 && selectedSector && selectedSeat && (
              <TicketSummary
                match={match}
                sector={selectedSector}
                seat={selectedSeat}
                price={price}
                userData={formData}
                onConfirm={handlePurchase}
                onBack={handleBack}
                loading={purchasing}
              />
            )}
          </GridLegacy>

          <GridLegacy item xs={12} md={5}>
            <MatchInfo match={match} />
          </GridLegacy>
        </GridLegacy>
      </Paper>
    </Container>
  );
}
