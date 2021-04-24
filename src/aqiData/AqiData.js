import React, { useEffect, useState } from 'react';
import { Alert, Col, Container, Row, Spinner, Table } from 'reactstrap';
import getAqiGuideMap from '../utils/commonUtility'
import moment from 'moment';
import { Line } from "react-chartjs-2";

function AqiData() {
    const [aqiData, setAqiData] = useState([]);
    const [dynamicAqiState, setDynamicAqiState] = useState([]);
    const [aqiFinal, setAqiFinalState] = useState([]);
    const [chartData, setChartData] = useState({});
    const dynamicAqi = {}
    let dynamicAqiArray = []


    useEffect(() => {
        getAQI();
    }, []);

    useEffect(() => {
        let aqiArray = []
        setAqiFinalState([])
          dynamicAqiState.map((d,i) => {
              Object.entries(d).map((val) => {
                  let aqiHash = {}
                  aqiHash['city'] = val[0];
                  aqiHash['aqi'] = val[1][0];
                  aqiHash['time'] = val[1][1];
                  aqiHash['color'] = val[1][3];
                  aqiArray.push(aqiHash)

              })
          })
        setAqiFinalState(aqiArray)

    }, [dynamicAqiArray]);




    useEffect(() => {
        if (aqiData.length > 0) {
            handleUpdateMessage(aqiData);
        }
    }, [aqiData]);

    const getAQI = () => {
        const ws = new WebSocket('wss://city-ws.herokuapp.com');
        ws.onopen = () => {
            console.log('connected');
        };
        ws.onmessage = (evt) => {
            const message = JSON.parse(evt.data);
            let cityName = [];
            let cityAqi = [];
            setAqiData(message);
            setDynamicAqiState([])
            dynamicAqiArray = []
            message.forEach((detail, index) => {
                if (dynamicAqi[detail.city]!== undefined && dynamicAqi[detail.city].length>0){
                    let existingAqi = dynamicAqi[detail.city];
                    let aqiIndex = detail.aqi.toFixed(2);
                    let colorCode = getColorCode(aqiIndex);

                    dynamicAqi[detail.city] = [aqiIndex,moment(existingAqi[2]).fromNow(),new Date(),colorCode]
                }else{
                    let aqiIndex = detail.aqi.toFixed(2);

                    let colorCode = getColorCode(aqiIndex);
                    dynamicAqi[detail.city] = [aqiIndex,moment(new Date()).fromNow(),new Date(),colorCode]
                }

                cityName.push(detail.city);
                let aqiIndex = detail.aqi.toFixed(2);
                cityAqi.push(parseFloat(aqiIndex));
            });

            setChartData({
                labels: cityName,
                datasets: [
                    {
                        label: "City wise AQI",
                        data: cityAqi,
                        backgroundColor: ["rgba(75, 192, 192, 0.6)"],
                        borderWidth: 4
                    }
                ]
            });

            dynamicAqiArray.push(dynamicAqi)
            setDynamicAqiState(dynamicAqiArray)
        };
    };

    function getColorCode(aqiIndex){
        let colorCode;
        for (const [key, value] of Object.entries(getAqiGuideMap())) {
            let colorKey = key.split("-");
            if (between(aqiIndex, parseInt(colorKey[0]), parseInt(colorKey[1]))) {
                colorCode = value
            }
        }
        return colorCode;
    }

    function between(x, min, max) {
        return x >= min && x <= max;
    }

    function handleUpdateMessage(data) {
        return (
            <Table>
                <thead>
                <tr>
                    <th>City</th>
                    <th>Current AQI</th>
                    <th>Last Updated</th>
                </tr>
                </thead>
                <tbody>
                {data.length > 0 &&
                data.map((details, index) => {
                    return (
                        <tr key={index.city}>
                            <td>{details.city}</td>
                            <td>{details.aqi}</td>
                            <td>{Date.now()}</td>
                        </tr>
                    );
                })}
                </tbody>
            </Table>
        );
    }
    return (
        <>
            <Table>
                <thead>
                <tr>
                    <th>City</th>
                    <th>Current AQI</th>
                    <th>Last Updated</th>
                </tr>
                </thead>
                <tbody>
                {aqiFinal.length > 0 &&
                aqiFinal.map((details, index) => {
                    return (
                    <tr key={index}>
                    <td>{details['city']}</td>
                        <td><p style={{ color: details['color'] }}>{details['aqi']}</p></td>
                    <td>{details['time']}</td>
                    </tr>
                    );
                })}

                </tbody>
            </Table>

            <div>
                <Line
                    data={chartData}
                    options={{
                        responsive: true,
                        title: { text: "AQi Graph", display: true },
                        scales: {
                            yAxes: [
                                {
                                    ticks: {
                                        autoSkip: true,
                                        maxTicksLimit: 10,
                                        beginAtZero: true
                                    },
                                    gridLines: {
                                        display: false
                                    }
                                }
                            ],
                            xAxes: [
                                {
                                    gridLines: {
                                        display: false
                                    }
                                }
                            ]
                        }
                    }}
                />
            </div>

    </>);
}

export default AqiData;
