
const getAqiGuideMap= () =>{
  const aqiGuideMap = {}
  aqiGuideMap["0-50"] = "Dark Green"
  aqiGuideMap["51-100"] = "Green"
  aqiGuideMap["101-200"] = "Yellow"
  aqiGuideMap["201-300"] = "Orange"
  aqiGuideMap["301-400"] = "Red"
  aqiGuideMap["401-500"] = "Maroon"
  return aqiGuideMap;
}

export default getAqiGuideMap;
