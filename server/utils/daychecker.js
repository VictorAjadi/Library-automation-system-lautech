exports.isCheckedInToday=function(timestamp) {
    const checkInDate = new Date(timestamp); // Convert the timestamp to a Date object
    const today = new Date();
    // Reset the time parts of the dates to only compare the date parts
    const checkInDateOnly = new Date(
      checkInDate.getFullYear(),
      checkInDate.getMonth(),
      checkInDate.getDate()
    );
  
    const todayOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const checker = checkInDateOnly.getTime() === todayOnly.getTime();
    // Compare the two dates
    return checker
  }
  