import PropTypes from 'prop-types';
import { Typography } from '@mui/material';

/**
 * DateDisplay - Formats and displays dates in Norwegian format
 */
const DateDisplay = ({ date, variant = 'body2', showTime = false }) => {
  if (!date) return null;

  const formatDate = (dateValue) => {
    const d = new Date(dateValue);
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    if (showTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }

    return d.toLocaleDateString('nb-NO', options);
  };

  return (
    <Typography variant={variant} color="text.secondary">
      {formatDate(date)}
    </Typography>
  );
};

DateDisplay.propTypes = {
  date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  variant: PropTypes.string,
  showTime: PropTypes.bool,
};

export default DateDisplay;

