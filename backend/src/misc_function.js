function convertTime12HourTo24Hour(timeStr) {
    // Extract hour and minute from the time string
    timeStr = timeStr.trim();
    let hour = parseInt(timeStr.substring(0, 2));
    let minute = timeStr.substring(3, 5);
    console.log("timeStr",timeStr);
    console.log("hour", hour, "minute", minute)

    // Adjust hour for PM time
    if (timeStr.endsWith('pm') && hour < 12) {
        hour += 12;
    } else if (timeStr.endsWith('am') && hour === 12) {
        hour = 0; // Adjust hour to 0 for 12:00am
    }

    // Format hour and minute in 24-hour format
    const formattedHour = hour.toString().padStart(2, '0');
    
    // Return the converted time in "HH:mm" format
    return `${formattedHour}:${minute}`;
}

function formatDateTimeOutput(content) {
    const dateTime = new Date(content);
    
    // Get individual date components
    const day = dateTime.getDate();
    const month = dateTime.toLocaleString('default', { month: 'short' }); // Get month abbreviation
    const year = dateTime.getFullYear();

    // Get individual time components
    let hours = dateTime.getHours();
    const minutes = dateTime.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // Handle midnight (0 hours)

    // Format date and time
    const formattedDate = `${day} ${month} ${year}`;
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;

    return `${formattedDate} ${formattedTime}`;
}

module.exports = {
    convertTime12HourTo24Hour,
    formatDateTimeOutput
}