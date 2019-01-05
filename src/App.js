import React, { Component } from 'react';
import './App.css';
import * as tf from '@tensorflow/tfjs';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {mdlLoaded: false,
                  stkLoaded: false,
                  stkLoading: false,
                  imgURL: '',
                  stkURL: ''}

    this.onUpload = this.onUpload.bind(this);
    this.getSticker = this.getSticker.bind(this); 
  }

  async componentDidMount() {
    tf.setBackend('cpu')
    var mdl = await tf.loadModel('model/model.json')
    this.setState({model: mdl,
                   mdlLoaded: true})
  }

  onUpload(file) {
    let reader;
    var t = this;
    t.setState({stkLoading: true,
                stkLoaded: false})

    reader = new FileReader();

    reader.onload = function(event) {
      t.setState({imgURL: event.target.result})
      t.getSticker()
    }

    reader.readAsDataURL(file)
  }

  getSticker() {
    const t = this;
    var img = new Image()
    img.src = this.state.imgURL
    img.onload = function() {
      var this_ = t

      const sticker = tf.tidy(() => {
        const pixels = tf.fromPixels(img)
        img = null
        const img_arr = tf.image.resizeBilinear(pixels, [224,224]).cast('float32')
        pixels.dispose()
        const mask = this_.state.model.predict(img_arr.expandDims(0)).greaterEqual(.8).squeeze([0]).mul(tf.scalar(255))

        return tf.concat([img_arr.cast('int32'), mask], 2)
      })

      const canvas = document.createElement('canvas');
      canvas.width = 224;
      canvas.height = 224;

      tf.toPixels(sticker, canvas).then(() => {
          const sticker_url = canvas.toDataURL()
          this_.setState({stkURL: sticker_url,
                          stkLoaded: true,
                          stkLoading: false}) 
      })
      
    }
  }

  render() {
    return (
      <div className="App">
        {!this.state.mdlLoaded && <img className='mdlLoad' src="imgs/ball_loader.svg"></img>}
        {this.state.mdlLoaded && 
          <div>
            <h1 className="App-title">Cut Out My Face</h1>
            <h3 className="App-sub-title">Upload a cropped image of a face and we'll try to make a face sticker</h3>
            {!this.state.stkLoading &&
             <div>
              <input type="file" onChange={e => this.onUpload(e.target.files[0])} id="img-up" className="file-input"/>
              <label htmlFor="img-up" className="load-button upload">Upload Photo</label>
              {this.state.stkLoaded && <a className="load-button download" href={this.state.stkURL} download="face.png">&darr;</a>}
             </div>
            }
            <p  className ="stkLoading" style={{visibility: this.state.stkLoading ? 'visible' : 'hidden'}}>Creating face sticker...</p>
            {this.state.stkLoaded && 
              <img className="stk" src={this.state.stkURL} alt="Can't Get Sticker"></img>
            }
          </div>
        }
      </div>
    );
  }
}

export default App;
