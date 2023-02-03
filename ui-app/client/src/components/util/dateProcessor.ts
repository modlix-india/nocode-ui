export function dateProcessor(dateString: any): any {
    let date = new Date(dateString);

    return {
        add: function (unit: string, value: number): any {
            if (unit === 'days') {
                date.setDate(date.getDate() + value);
            } else if (unit === 'months') {
                date.setMonth(date.getMonth() + value);
            } else if (unit === 'years') {
                date.setFullYear(date.getFullYear() + value);
            }
            return date;
        },
        subtract: function (unit: string, value: number): any {
            if (unit === 'days') {
                date.setDate(date.getDate() - value);
            } else if (unit === 'months') {
                date.setMonth(date.getMonth() - value);
            } else if (unit === 'years') {
                date.setFullYear(date.getFullYear() - value);
            }
            return date;
        },
        format: function (dateFormat: string): any {
            let formats: { [key: string]: string } = {
                "DD-MM-YYYY": date.toLocaleDateString("en-US", { day: '2-digit', month: '2-digit', year: 'numeric' }),
                "MM/DD/YYYY": date.toLocaleDateString("en-US", { month: '2-digit', day: '2-digit', year: 'numeric' }),
                "YYYY-MM-DD": date.toISOString().slice(0, 10),
                "MM/DD/YY": date.toLocaleDateString("en-US", { month: '2-digit', day: '2-digit', year: '2-digit' }),
                "MMM DD": date.toLocaleDateString("en-US", { month: 'short', day: '2-digit' }),
                "MMMM DD, YYYY": date.toLocaleDateString("en-US", { month: 'long', day: '2-digit', year: 'numeric' }),
                "dd MMM D YY": date.toLocaleDateString("en-US", { weekday: 'narrow', month: 'short', day: 'numeric', year: '2-digit' }),
                "MMM D, YY": date.toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: '2-digit' }),
                "YYYY-MM-DD HH:mm": date.toISOString().slice(0, 16),
                "YYYY-MM-DD hh:mm A": date.toLocaleString("en-US", { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true }),
                "YYYY-MM-DD HH:mm:ss": date.toISOString().slice(0, 19),
                "YYYY-MM-DD hh:mm:ss A": date.toLocaleString("en-US", { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
                "hh:mm A": date.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: true }),
                "ddd MMM D YY h:mm A": date.toLocaleString("en-US", { weekday: 'short', month: 'short', day: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true }),
                "MMM D YYYY hh:mm A": date.toLocaleString("en-US", { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }),
                "dddd, MMM D YYYY hh:mm A": date.toLocaleString("en-US", { weekday: 'long', month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }),
            };
            return formats[dateFormat];
        },
        value: function () {
            return date;
        }
    }
}