'use client';
import { useState } from 'react';
import { Header } from '@/widgets/Header';
import { FormUser } from '@/widgets/FormUser/ui/FormUser';
import { TableMyTickets } from '@/widgets/TableMyTickets/ui/TableMyTickets';
import { FanStats } from '@/widgets/FanStats/FanStats';
import { Tabs, Tab, Box, Paper } from '@mui/material';
import { Person, ConfirmationNumber, Assessment } from '@mui/icons-material';
import styles from './user.module.css';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export const UserPage = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <div>
      <Header />
      <Box className={styles.pageContainer}>
        <Paper className={styles.tabsContainer} elevation={0}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab icon={<Person />} label="Личные данные" />
            <Tab icon={<ConfirmationNumber />} label="Мои билеты" />
            <Tab icon={<Assessment />} label="Статистика" />
          </Tabs>
        </Paper>

        <TabPanel value={tabValue} index={0}>
          <FormUser />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <TableMyTickets />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <FanStats />
        </TabPanel>
      </Box>
    </div>
  );
};
