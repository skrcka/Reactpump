import React from 'react'
import './App.css';
import { Input, Progress, Button, Label, Form, FormGroup, Container, Row, Col } from 'reactstrap'
import ReactInterval from 'react-interval';
import axios from 'axios';

let API_URL = 'HTTP://10.0.28.171:5000'; // 'HTTP://10.0.28.171:5000' 'HTTP://127.0.0.1:5000';

class App extends React.Component {
    state = {
        mode: 0, // 0 disabled, 1 default
        ml: 0,
        time: 0,
        progress: 0,
    };

    fetchData(){
        axios.get(`${API_URL}/status`).then( result => {
            this.setState({
                mode: result.data.mode,
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
        let link = window.location.href.split(':');
        //API_URL = `${link[0]}:${link[1]}:5000`;
        console.log(API_URL)
        this.fetchData();
    };

    checkForUpdates = async () => {
        const result = await axios.get(`${API_URL}/status`);
        if(result.data.mode){
            if(!this.state.mode)
                this.setState({
                    mode: result.data.mode,
                });
            this.setState({
                ml: result.data.ml,
                time: result.data.time,
                progress: result.data.progress
            });
        }
        else {
            if(this.state.mode)
                this.setState({
                    ml: result.data.ml,
                    time: result.data.time,
                    mode: result.data.mode,
                });
        }
    }

    sendDataToBackend = async () => {
        await axios.post(`${API_URL}/update_status`,
            [
                this.state.ml,
                this.state.time,
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
            mode,
            ml,
            time,
            progress,
        } = this.state

        return (
            <div className="App">
                <ReactInterval timeout={100} enabled={true} callback={this.checkForUpdates} />
                <header className="App-header">
                <h1>Pump controller</h1>
                <div className='main'>
                    {mode === 1 &&
                        <Container fluid='sm'>
                            <Label className='text-left' for="progress">Running...      timeleft: {time.toFixed(1)}</Label>
                            <Progress name='progress' animated color="primary" value={progress} />
                            <Button className='mt-3' color="danger" onClick={this.stopBackend}>STOP</Button>
                        </Container>
                    }
                    {mode === 0 &&
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
                                                <Input className='mt-2' name='ml' type="range" min="0" max="16" step="0.05" value={ml} onChange={(event) => {
                                                    this.setState({ ml: parseFloat(event.target.value)} );
                                                }} />
                                            </Col>
                                            <Col xs='3'>
                                                <Input value={ml ? ml : ""}  onChange={(event) => {
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
                                                <Input className='mt-2' type='range' name='time' min="0" max="1000" step="0.5" value={time} onChange={(event) => {
                                                    if(event.target.value === ""){
                                                        this.setState({ time: 0.0} );
                                                        return;
                                                    }
                                                    this.setState({ time: parseFloat(event.target.value) })
                                                }} />
                                            </Col>
                                            <Col xs='3'>
                                                <Input value={time ? time : ""} onChange={(event) => {
                                                    if(event.target.value === ""){
                                                        this.setState({ time: 0.0} );
                                                        return;
                                                    }
                                                    this.setState({ time: parseFloat(event.target.value) })
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