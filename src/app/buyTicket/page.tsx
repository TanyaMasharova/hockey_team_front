'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Container,
  Grid,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Paper,
} from '@mui/material';
import { getMatchById } from '@/shared/api/matches';
import { getStadiumSectors, getSeatsBySector } from '@/shared/api/matches';
import { createTicket } from '@/shared/api/ticket';
import { useError } from '@/shared/context/ErrorContext';
import MatchInfo from './components/MatchInfo';
import SectorSelector from './components/SectorSelector';
import SeatSelector from './components/SeatSelector';
import TicketSummary from './components/TicketSummary';
import PurchaseForm from './components/PurchaseForm';
import styles from './page.module.css';

// Add this to prevent hydration errors
const NoSSR = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? <>{children}</> : null;
};

interface Match {
  id: string;
  opponent_name: string;
  match_date: string;
  home_away: string;
  our_score: number;
  opponent_score: number;
  status: string;
  is_derby: boolean;
}

interface Sector {
  id: string;
  sector_number: string;
  capacity: number;
  sector_type: string;
  price_coefficient: number;
  color_code: string;
}

interface Seat {
  id: string;
  seat_row: string;
  seat_number: string;
  is_handicap_accessible: boolean;
  is_taken: boolean;
}

const steps = ['Выбор сектора', 'Выбор места', 'Подтверждение', 'Оплата'];

export default function PurchaseTicketPage() {
  const params = useParams();
  const router = useRouter();
  const { setError } = useError();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [isClient, setIsClient] = useState(false); // Add this

  const [match, setMatch] = useState<Match | null>(null);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const matchId = params.id as string;

      // Add error handling for API calls
      const [matchData, sectorsData] = await Promise.all([
        getMatchById(matchId),
        getStadiumSectors(),
      ]);
      setMatch(matchData);
      setSectors(sectorsData);
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  };

  const handleSectorSelect = async (sector: Sector) => {
    setSelectedSector(sector);
    try {
      const seatsData = await getSeatsBySector(sector.id);
      setSeats(seatsData);
      setActiveStep(1);
    } catch (error) {
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
      await createTicket({
        user_id: userId,
        match_id: match.id,
        seat_id: selectedSeat.id,
        final_price: price,
        ...formData,
      });

      router.push('/profile?purchase=success');
    } catch (error) {
      console.error('Purchase failed:', error);
      setError('Ошибка при покупке билета');
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

  // Show nothing on server-side to prevent hydration mismatch
  if (!isClient) {
    return null;
  }

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
    <NoSSR>
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

          <Grid container spacing={4}>
            <Grid item xs={12} md={7}>
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
                />
              )}

              {activeStep === 2 && (
                <PurchaseForm initialData={formData} onSubmit={handleFormSubmit} />
              )}

              {activeStep === 3 && (
                <TicketSummary
                  match={match}
                  sector={selectedSector}
                  seat={selectedSeat}
                  price={price}
                  userData={formData}
                  onConfirm={handlePurchase}
                  onBack={() => setActiveStep(2)}
                  loading={purchasing}
                />
              )}
            </Grid>

            <Grid item xs={12} md={5}>
              <MatchInfo match={match} />
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </NoSSR>
  );
}
