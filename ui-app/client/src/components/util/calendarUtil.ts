export const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

export const formatDateTo = (date: Date): number => {
    const month = date.getUTCMonth();
    const day = date.getUTCDate();
    const year = date.getUTCFullYear();
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const seconds = date.getUTCSeconds();
    const milliseconds = date.getUTCMilliseconds();

    const newDate = Date.UTC(year, month, day, hours, minutes, seconds, milliseconds);

    return newDate;
};

export function preprocess(date: string) {
    return Math.floor(parseInt(date) / 1000).toString();
} // preprocessor to convert the date to a any format