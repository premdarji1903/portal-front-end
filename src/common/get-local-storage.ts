// let getLocalStorageData: any = localStorage.getItem("userData")
// getLocalStorageData = JSON.parse(getLocalStorageData)

let getLocalStorageData: any = null;

// Try to get from localStorage
const localStorageData = localStorage.getItem("userData");
if (localStorageData) {
    try {
        getLocalStorageData = JSON.parse(localStorageData);
    } catch (error) {
        console.error("Failed to parse userData from localStorage:", error);
    }
}

// If not in localStorage, check cookies
const cookies = document.cookie.split('; ');
const userCookie = cookies.find(c => c.startsWith('userData='));

if (userCookie) {
    try {
        const userDataStr = decodeURIComponent(userCookie.split('=')[1]);
        const jsonStr = userDataStr.startsWith('j:') ? userDataStr.slice(2) : userDataStr;
        getLocalStorageData = JSON.parse(jsonStr);

        // Set in localStorage for future use
        localStorage.setItem("userData", JSON.stringify(getLocalStorageData));
    } catch (error) {
        console.error("Failed to parse userData from cookies:", error);
    }
}

export default getLocalStorageData