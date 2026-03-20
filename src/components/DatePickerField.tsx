import TextField from '@mui/material/TextField';
import { useState } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import Box from '@mui/material/Box';

export default function DatePickerField({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const [date, setDate] = useState<Dayjs | null>(value ? dayjs(value) : null);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ mt: 2, mb: 1.5, '.MuiInputBase-root': { borderRadius: 3, background: 'rgba(30,32,53,0.9)', color: '#F1F5F9', fontWeight: 500 }, '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.06)' }, '.MuiInputLabel-root': { color: '#F1F5F9', fontWeight: 600 }, '.MuiPickersDay-root': { background: 'rgba(99,102,241,0.08)', color: '#F1F5F9' }, '.MuiPickersDay-today': { borderColor: '#F59E0B' }, '.MuiPickersDay-selected': { background: '#6366F1 !important', color: '#F1F5F9 !important' }, '.MuiPaper-root': { backgroundColor: '#141625 !important', borderRadius: '20px !important', border: '1px solid rgba(255,255,255,0.06)' } }}>
        <DatePicker
          label="Dato"
          value={date}
          onChange={(newDate) => {
            setDate(newDate);
            onChange(newDate ? newDate.format('YYYY-MM-DD') : '');
          }}
          slotProps={{ textField: { fullWidth: true } }}
        />
      </Box>
    </LocalizationProvider>
  );
}
