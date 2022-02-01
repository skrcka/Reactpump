import React from 'react'
import './App.css';
import { Input, Progress, Button } from 'reactstrap'
import ReactInterval from 'react-interval';
import axios from 'axios';

const API_URL = 'HTTP://10.0.28.171:5000';

class App extends React.Component {
    state = {
        running: false,
        ml: 0,
        time: 0,
        progress: 0,
    };

    fetchData(){
        axios.get(`${API_URL}/status`).then( result => {
            this.setState({
                running: result.data.enabled,
                ml: result.data.ml,
                time: result.data.time,
                progress: result.data.progress
            });
        });
    }

    /**
     * Initial data fetch
     */
    componentDidMount = () => {
        this.fetchData();
    };

    checkIfRunning = async () => {
        const result = await axios.get(`${API_URL}/status`);
        this.setState({
            running: result.data.enabled,
        });
        if(this.state.enabled != this.prevState.enabled){
            this.setState({
                ml: result.data.ml,
                time: result.data.time,
                progress: result.data.progress
            });
        }
    }

    sendDataToBackend = async () => {
        const result = await axios.post(`${API_URL}/update_status`,
            [
                this.state.ml,
                this.state.time,
            ]
        );
        this.fetchData();
    };

    stopBackend = async () => {
        const result = await axios.get(`${API_URL}/stop`)
        this.fetchData();
    };

    render() {
        const {
            running,
            ml,
            time,
            progress,
        } = this.state

        return (
            <div className="App">
                <ReactInterval timeout={250} enabled={true} callback={this.checkIfRunning} />
                <header className="App-header">
                    {running &&
                        <div>
                            <Progress animated color="primary" value={progress} />
                            <Button color="danger" onClick={this.stopBackend}>STOP</Button>
                        </div>
                    }
                    {!running &&
                        <div>
                            <h1>Start</h1>
                            <Input value={ml ? ml : ""} onChange={(event) => {
                                if(event.target.value === ""){
                                    this.setState({ ml: 0.0} );
                                    return;
                                }
                                this.setState({ ml: parseFloat(event.target.value)} );
                            }} />
                            <Input value={time ? time : ""} onChange={(event) => {
                                if(event.target.value === ""){
                                    this.setState({ time: 0.0} );
                                    return;
                                }
                                this.setState({ time: parseFloat(event.target.value) })
                            }} />
                            <Button color="primary" onClick={this.sendDataToBackend}>GO</Button>
                        </div>
                    }
                </header>
            </div>
        );
    };
}

export default App;