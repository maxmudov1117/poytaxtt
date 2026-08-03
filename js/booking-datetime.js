function pad(value) {
  return String(value).padStart(2, '0');
}

function formatDateTimeLocal(date) {
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate())
  ].join('-') + 'T' + [pad(date.getHours()), pad(date.getMinutes())].join(':');
}

function isDateTimeAllowed(value, now = new Date()) {
  if (!value) {
    return false;
  }

  const selectedDate = new Date(value);
  if (Number.isNaN(selectedDate.getTime())) {
    return false;
  }

  return selectedDate.getTime() >= now.getTime();
}

if (typeof window !== 'undefined') {
  window.formatDateTimeLocal = formatDateTimeLocal;
  window.isDateTimeAllowed = isDateTimeAllowed;
}

if (typeof module !== 'undefined') {
  module.exports = {
    formatDateTimeLocal,
    isDateTimeAllowed
  };
}
