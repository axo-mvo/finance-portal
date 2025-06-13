import React from 'react';

class Section extends React.Component{
  render() {
    <section className="bg-white">
      <div className="container pb-5"> 
        <div className="row bg-gray">
          <div className="col-12 col-md-6 careers-it">
            <p className="aff-steps-arrow remove-desktop">
              <i className="arrow-down"></i>
            </p>
          </div>
          <div className="col-12 col-md-6 py-4 p-lg-5 hr-left">
            <h3>{this.props.title}</h3>
            <hr />
            <p>{this.props.description1}</p>
            <p>{this.props.description2}</p>
            <p>
              <a href={`mailto:${this.props.email}`}>{data.ctaText}</a>
            </p>
          </div>
        </div>
      </div>
    </section>
  }
}
function App() {
  return (
    <div>
      Hello world
      <Section email="marius@valle-olsen.no" title="Overskrift" description1="Seksjon 1" description2 = "Seksjon 2"/>      
    </div>
    
  );
}
export default App;
