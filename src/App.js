import React, { Component } from 'react';
import './App.css';
import * as tf from '@tensorflow/tfjs';

let model;

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {imgURL: ''}

    this.onUpload = this.onUpload.bind(this);
    this.getSticker = this.getSticker.bind(this);
  }


  onUpload(file) {
    let reader;
    var t = this;
    reader = new FileReader();

    reader.onload = function(event) {
      t.setState({imgURL: event.target.result})
      t.getSticker()
    }

    reader.readAsDataURL(file)
  }

  getSticker() {
    var img = new Image()
    img.src = this.state.imgURL
    const model = tf.loadModel('./model/model.json')

    img.onload = function() {
      var img_arr = tf.fromPixels(img)
      img_arr = tf.image.resizeBilinear(img_arr, [224,224])

      model.predict(img_arr).print()
    }
  }

  render() {
    return (
      <div className="App">
          <h1 className="App-title">Cut Out My Face</h1>
          <h3 className="App-sub-title">The Easy Way to Make Face Stickers From Your Pics</h3>
          <input type="file" onChange={e => this.onUpload(e.target.files[0])} id="img-up" className="file-input"/>
          <label for="img-up" className="upload-button">Upload Photo</label>
      </div>
    );
  }
}

export default App;
