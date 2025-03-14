let getLocalStorageData: any = localStorage.getItem("userData")
getLocalStorageData = JSON.parse(getLocalStorageData)

export default getLocalStorageData