/**
 * Formats ISO date strings into clean human-readable date and time in Hindi or English
 */
export function formatDateTime(isoString?: string, language: 'en' | 'hi' = 'en'): string {
  if (!isoString) {
    return language === 'hi' ? 'लागू नहीं (Not Activated)' : 'Not Activated';
  }
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    
    const day = d.getDate().toString().padStart(2, '0');
    const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthsHi = ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
    const month = language === 'hi' ? monthsHi[d.getMonth()] : monthsEn[d.getMonth()];
    const year = d.getFullYear();
    
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedHour = hours.toString().padStart(2, '0');
    
    return `${day} ${month} ${year}, ${formattedHour}:${minutes} ${ampm}`;
  } catch {
    return isoString;
  }
}

export function formatDateOnly(isoString?: string, language: 'en' | 'hi' = 'en'): string {
  if (!isoString) {
    return language === 'hi' ? 'लागू नहीं' : 'Not Activated';
  }
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const day = d.getDate().toString().padStart(2, '0');
    const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthsHi = ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
    const month = language === 'hi' ? monthsHi[d.getMonth()] : monthsEn[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return isoString;
  }
}
