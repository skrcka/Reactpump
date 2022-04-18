import React from 'react'
import './App.css';
import { Input, Progress, Button, Label, Form, FormGroup, Container, Row, Col } from 'reactstrap'
import ReactInterval from 'react-interval';
import axios from 'axios';

let API_URL = 'HTTP://10.0.28.171:5000'; // 'HTTP://10.0.28.171:5000' 'HTTP://127.0.0.1:5000';

class App extends React.Component {
    state = {
        running: false,
        mode: 0, // 1 default, 2 asap
        ml: 0,
        time_rate: 0,
        pull: false,
        progress: 0,
        steps_per_ml: 0,
        syringe_size: 0,
    };

    fetchData(){
        axios.get(`${API_URL}/status`).then( result => {
            this.setState({
                running: result.data.running,
                mode: result.data.mode,
                ml: result.data.ml,
                time_rate: result.data.time_rate,
                progress: result.data.progress,
                steps_per_ml: result.data.steps_per_ml,
                syringe_size: result.data.syringe_size,
            });
        });
    }

    /**
     * Initial data fetch
     */
    componentDidMount = () => {
        let link = window.location.href.split(':');
        //API_URL = `${link[0]}:${link[1]}:5000`;
        console.log(API_URL)
        this.fetchData();
    };

    checkForUpdates = async () => {
        const result = await axios.get(`${API_URL}/status`);
        if(result.data.running){
            if(!this.state.running)
                this.setState({
                    running: result.data.running,
                });
            this.setState({
                ml: result.data.ml,
                time_rate: result.data.time_rate,
                progress: result.data.progress,
            });
        }
        else {
            if(this.state.running)
                this.setState({
                    ml: result.data.ml,
                    time_rate: result.data.time_rate,
                    running: result.data.running,
                });
        }
    }

    sendDataToBackend = async () => {
        await axios.post(`${API_URL}/update_status`,
            [
                2,
                true,
                this.state.ml,
                this.state.time_rate,
            ]
        );
        this.fetchData();
    };

    sendConfigToBackend = async () => {
        await axios.post(`${API_URL}/update_config`,
            [
                this.state.steps_per_ml,
                this.state.syringe_size,
            ]
        );
        this.fetchData();
    };

    stopBackend = async () => {
        await axios.get(`${API_URL}/stop`)
        this.fetchData();
    };

    render() {
        const {
            running,
            mode,
            ml,
            time_rate,
            pull,
            progress,
            steps_per_ml,
            syringe_size
        } = this.state

        return (
            <div className="App">
                <ReactInterval timeout={100} enabled={true} callback={this.checkForUpdates} />
                <header className="App-header">
                <h1>Pump controller</h1>
                <div className='main'>
                    {running &&
                        <Container fluid='sm'>
                            <Label className='text-left' for="progress">Running...      timeleft: {time_rate.toFixed(1)}</Label>
                            <Progress name='progress' animated color="primary" value={progress} />
                            <Button className='mt-3' color="danger" onClick={this.stopBackend}>STOP</Button>
                        </Container>
                    }
                    {!running &&
                        <Container fluid='sm'>
                            <Form>
                                <div className='text-left'>
                                    <FormGroup>
                                        <Row>
                                            <Col>
                                                <Label for="ml">How much? (ml)</Label>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col xs='9'>
                                                <Input className='mt-2' name='ml' type="range" min="0" max={syringe_size} step="0.05" value={ml ? ml : 0} onChange={(event) => {
                                                    this.setState({ ml: parseFloat(event.target.value)} );
                                                }} />
                                            </Col>
                                            <Col xs='3'>
                                                <Input value={ml ? ml : 0}  onChange={(event) => {
                                                    if(event.target.value === ""){
                                                        this.setState({ ml: 0.0} );
                                                        return;
                                                    }
                                                    this.setState({ ml: parseFloat(event.target.value) })
                                                }} />
                                            </Col>
                                        </Row>
                                    </FormGroup>
                                    <FormGroup>
                                        <Row>
                                            <Label for="time">In how long? (sec)</Label>
                                        </Row>
                                        <Row>
                                            <Col xs='9'>
                                                <Input className='mt-2' type='range' name='time' min="0" max="1000" step="0.5" value={time_rate} onChange={(event) => {
                                                    if(event.target.value === ""){
                                                        this.setState({ time_rate: 0.0} );
                                                        return;
                                                    }
                                                    this.setState({ time_rate: parseFloat(event.target.value) })
                                                }} />
                                            </Col>
                                            <Col xs='3'>
                                                <Input value={time_rate ? time_rate : 0} onChange={(event) => {
                                                    if(event.target.value === ""){
                                                        this.setState({ time_rate: 0.0} );
                                                        return;
                                                    }
                                                    this.setState({ time_rate: parseFloat(event.target.value) })
                                                }} />
                                            </Col>
                                        </Row>
                                    </FormGroup>
                                </div>
                                <Button color="primary" onClick={this.sendDataToBackend}>START</Button>
                            </Form>
                        </Container>
                    }
                </div>
                </header>
            </div>
        );
    };
}

export default App;