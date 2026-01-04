const DateConverter = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();

    // Get date parts
    const dateDay = date.getDate();
    const dateMonth = date.getMonth();
    const dateYear = date.getFullYear();

    const nowDay = now.getDate();
    const nowMonth = now.getMonth();
    const nowYear = now.getFullYear();

    // Format time as HH:mm
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const monthName = date.toLocaleString('en-US', { month: 'long' });

    // Today
    if (dateDay === nowDay && dateMonth === nowMonth && dateYear === nowYear) {
        return `Today, ${time}`;
    }

    // Yesterday
    const yesterday = new Date(now);
    yesterday.setDate(nowDay - 1);
    if (
        dateDay === yesterday.getDate() &&
        dateMonth === yesterday.getMonth() &&
        dateYear === yesterday.getFullYear()
    ) {
        return `Yesterday, ${time}`;
    }

    // Within this year
    if (dateYear === nowYear) {
        return `${dateDay} ${monthName}, ${time}`;
    }

    // More than a year ago
    return `${dateYear} ${monthName} ${dateDay}`;
};

export default DateConverter;