export const getTimeZone = (date: Date) => {
  const dateTime = new Date(date).toString().match(/\(([A-Za-z\s].*)\)/);
  return dateTime
    ? dateTime[1]
        ?.split(' ')
        .map((w) => w[0])
        .join('')
    : '';
};

export const getFormatedDateTime = (date: Date) => {
  return (
    new Intl.DateTimeFormat('en-US', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(date) +
    ' ' +
    getTimeZone(date)
  );
};
