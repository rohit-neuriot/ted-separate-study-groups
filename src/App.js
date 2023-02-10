import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { Map, TileLayer } from "react-leaflet";
import "./App.css";
import "leaflet/dist/leaflet.css";

import nationalParksData from "./study-groups.json";
import { studyGroups, HCPs } from "./data/dropdown"
import FilterDropdown from "./FilterDropdown";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("./images/marker-icon-2x.png"),
  iconUrl: require("./images/marker-icon.png"),
  shadowUrl: require("./images/marker-shadow.png"),
  shadowSize: 4,
  className:"map-marker"
});

function App() {
  const [studyGroupLabels, setStudyGroupLabels] = useState([])  
  const mapRef = useRef();

  const [nationalParksFull, setNationalParksFull] = useState(nationalParksData)
  const [nationalParks, setNationalParks] = useState(nationalParksData)

  // -> 'study_group', 'hcp', 'initial' (only during start)
  const [selectedFilterType, setSelectedFilterType] = useState('initial')

  const [studyGroupsFilterValue, setStudyGroupsFilterValue] = useState("")
  const [hcpFilterValue, setHcpFilterValue] = useState("")

  useEffect(() => {
    const { current = {} } = mapRef;
    const { leafletElement: map } = current;
    
    if (!map) return;

    const parksGeoJson = new L.GeoJSON(nationalParks, {
      onEachFeature: (feature = {}, layer) => {
        const { properties = {} } = feature;
        const { Name, Code, Speciality } = properties;

        if (!Name) return;

        // layer.bindPopup(`<p>${Name}</p>`);
        let tooltipContent = `<h5 style="color: #000000; margin: 0; padding: 0; font-weight: bold; padding-right: 48px;">${Name}</h5>`

        if (Speciality) {
          tooltipContent += `<p style="margin: 6px 0 0; padding: 0; color: #212121; font-size: 14px; font-weight: bold;">Speciality</p>`
          tooltipContent += `<p style="margin: 0; padding: 0; color: #000000; font-size: 10px;">${Speciality}</p>`  
        }

        // condition to see whether hcp filter is enabled or not right now
        if (selectedFilterType == "study_group" || selectedFilterType == "initial") {
          tooltipContent += `<p style="margin: 6px 0 0; padding: 0; color: #212121; font-size: 14px; font-weight: bold;">Study Group</p>`
          tooltipContent += `<p style="margin: 0; padding: 0; color: #000000; font-size: 10px;">${Code}</p>`
        } else {
          tooltipContent += `<p style="margin: 6px 0 0; padding: 0; color: #212121; font-size: 14px; font-weight: bold;">Study Groups</p>`
          
          let result = [];
          for (let studyGroupPersonLabels of studyGroupLabels) {
            if (Object.keys(studyGroupPersonLabels) == Name) {
              result = studyGroupPersonLabels[Name];
              break;
            }
          }

          // console.log("testplus", studyGroupLabels, Name)
          let labelsUnique = [...new Set(result.map(x => x.properties.Code))]
          for (let label of labelsUnique) {
            tooltipContent += `<p style="margin: 0; padding: 0; color: #000000; font-size: 10px;">${label}</p>`
          }
        }

        layer.bindTooltip(tooltipContent);
      }
    });

    parksGeoJson.addTo(map);
  }, [nationalParks]);

  useEffect(() => reRender([{label: 'British Oculoplastic Surg Soc BOP', value: 'British Oculoplastic Surg Soc BOP'}], "study_group"), [])

  function clearSelectedHCPFilter() {
    setHcpFilterValue([])
  }

  function clearSelectedStudyGroupFilter() {
    setStudyGroupsFilterValue([])
  }

  // useEffect(() => getStudyGroupsForHCP("James F Howard"), [selectedFilterType])

  function getStudyGroupsForHCP(hcpNamesArr) {
    let studyGroups = []

    // find study groups for each
    for (let hcpName of hcpNamesArr) {
      const name = hcpName.value
      
      // push into final array
      const data = nationalParksFull.features.filter(hcp => hcp.properties.Name == name)
      // studyGroups = data.map(item => item.properties.Code)

      // console.log('hcpNamesss', data)

      studyGroups.push({[data[0].properties.Name]: data})
    }

    if (studyGroups.length > 0) {
      // return first of the many available study groups for the specific HCPs
      // console.log('hcp names combined ->', studyGroups.map(x => x.properties.Code))
      // setStudyGroupLabels([...new Set(studyGroups.map(x => x.properties.Code))])

      setStudyGroupLabels(studyGroups)

      // console.log('studygroupsss', studyGroups)

      // 
      const result = []

      for (let studyGroup of studyGroups) {
      result.push(...Object.values(studyGroup))
      }

      // console.log("test", result)
      // 

      return result.map(x => x[0])
    } else {
      return [] //studyGroups // []
    }
  }

  function reRender(selectedValuesArr, type) {
    const selectedValues = selectedValuesArr.map(x => x.value)

    if (type == "study_group") {
      setSelectedFilterType('study_group')
      setStudyGroupsFilterValue(selectedValuesArr)
      clearSelectedHCPFilter()

      if (selectedValues.includes("All")) {
        setNationalParks(nationalParksFull)
      } else {
        setNationalParks({
          "type": "FeatureCollection",
          "features": nationalParksFull.features.filter(marker => selectedValues.includes(marker.properties.Code))
        })
      }
    }

    if (type == "hcp") {
      setSelectedFilterType('hcp')
      setHcpFilterValue(selectedValuesArr)
      clearSelectedStudyGroupFilter()

      setNationalParks({
          "type": "FeatureCollection",
          "features": getStudyGroupsForHCP(selectedValuesArr)
      })
    }
  }

  return (
    <div>   
      <div className="d-flex align-items-center p-2">
        <div className="d-flex flex-grow-1" style={{width: "50%"}}>
          <h6 className="my-auto me-2" style={{fontSize: 12, color: "#666666"}}>STUDY GROUPS</h6>
          <FilterDropdown value={studyGroupsFilterValue} type="study_group" defaultValue={true} data={studyGroups} isEnabled={selectedFilterType == "study_group" || selectedFilterType == "initial"} reRender={reRender} />
        </div>

        <div className="d-flex ms-4 flex-grow-1" style={{width: "50%"}}>
          <h6 className="my-auto me-2" style={{fontSize: 12, color: "#666666"}}>HCP</h6>
          <FilterDropdown value={hcpFilterValue} type="hcp" defaultValue={false} data={HCPs} isEnabled={selectedFilterType == "hcp" || selectedFilterType == "initial"} reRender={reRender} />
        </div>
      </div>
      
      <h4 className="text-left mt-3" style={{fontSize: 16, color: "#333333"}}>Zoom in to view distinct HCPs</h4>

      <Map key={Math.random()} ref={mapRef} center={[39.5, -98.35]} zoom={3}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
      </Map>
    </div>
  );
}

export default App;
