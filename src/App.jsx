import React from 'react'
import './App.css';
import { Input, Progress, Button, Label, Form, FormGroup, Container } from 'reactstrap'
import ReactInterval from 'react-interval';
import axios from 'axios';

const API_URL = 'HTTP://127.0.0.1:5000';

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

    checkForUpdates = async () => {
        const result = await axios.get(`${API_URL}/status`);
        if(result.data.enabled){
            if(!this.state.running)
                this.setState({
                    running: result.data.enabled,
                });
            this.setState({
                ml: result.data.ml,
                time: result.data.time,
                progress: result.data.progress
            });
        }
        else {
            if(this.state.running)
                this.setState({
                    ml: result.data.ml,
                time: result.data.time,
                    running: result.data.enabled,
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
                <ReactInterval timeout={100} enabled={true} callback={this.checkForUpdates} />
                <header className="App-header">
                <h1>Pump controller</h1>
                    {running &&
                        <Container fluid='sm'>
                            <Label className='text-left' for="progress">Running...      timeleft: {time.toFixed(1)}</Label>
                            <Progress name='progress' animated color="primary" value={progress} />
                            <Button color="danger" onClick={this.stopBackend}>STOP</Button>
                        </Container>
                    }
                    {!running &&
                        <Container fluid='sm'>
                            <Form>
                                <div className='text-left'>
                                    <FormGroup>
                                        <Label for="ml">How much? (ml)</Label>
                                        <Input name='ml' value={ml ? ml : ""} onChange={(event) => {
                                            if(event.target.value === ""){
                                                this.setState({ ml: 0.0} );
                                                return;
                                            }
                                            this.setState({ ml: parseFloat(event.target.value)} );
                                        }} />
                                    </FormGroup>
                                    <FormGroup>
                                        <Label for="time">In how long? (sec)</Label>
                                        <Input name='time' value={time ? time : ""} onChange={(event) => {
                                            if(event.target.value === ""){
                                                this.setState({ time: 0.0} );
                                                return;
                                            }
                                            this.setState({ time: parseFloat(event.target.value) })
                                        }} />
                                    </FormGroup>
                                </div>
                                <Button color="primary" onClick={this.sendDataToBackend}>START</Button>
                            </Form>
                        </Container>
                    }
                </header>
            </div>
        );
    };
}

export default App;