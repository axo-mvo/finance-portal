import logo from './logo.svg';
import './App.css';
import React from 'react';
const name = "Marius";
const people = ["Marius", "Arne", "Bjarne"];

function formatName(theName)
{
  return "Mr. " + theName;
}
class Welcome extends React.Component {
  constructor(props) {
    super(props);
    this.resetCounter = this.resetCounter.bind(this);
    this.state = {date: new Date(), timercount: 0};
   
  }
  componentDidMount() {
    
    this.timerID = setInterval(
      () => this.tick(),
      1000
    );
  }
  resetCounter() {
    this.setState({timercount: 0});
  }
  
  tick() {
    this.setState((state, props) => ({
      timercount: state.timercount+1,
      date: new Date()
    }));
  }
  componentWillUnmount() {
    clearInterval(this.timerID);
  }
  render() {
    return <h3>Hello, {formatName(this.props.name)} {this.state.date.toLocaleTimeString()} {this.state.timercount} 
    {this.state.timercount > 10 ? <ResetButton onClick={this.resetCounter}/> : <div>Soon</div>}
    </h3>;
  }
}
class ResetButton extends React.Component{
  render(){
    return <button onClick={this.props.onClick}>Reset button</button>
  }
}
const listItems = people.map((person) =>
  <Welcome name={person} key={person}/>
);
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edits <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn Reacts  Valle--Olsen ... </a>
          
        <ul>{listItems}</ul>
      </header>
      
    </div>
    
  );
}
export default App;
 