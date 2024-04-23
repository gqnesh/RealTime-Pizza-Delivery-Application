import axios from 'axios';
import { Notyf } from 'notyf';

const notyf = new Notyf({
  duration: 1000,
  position: {
    x: 'right',
    y: 'top',
  }
});

function placeOrder(formObject) {

  //axios

  axios.post("/home/orders", formObject)
    .then((res) => {
      // res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0')
      const url = res.data.url;
      if (url) {
        window.location.href = url;
      }
      console.log("here")
      
      setTimeout(() => {
        window.location.href = '/home/orders';
      }, 1000);

      notyf.open({
        type: 'success',
        message: res.data.message
      });

    })
    .catch((err) => {
      // console.log(err)

      notyf.open({
        type: 'success',
        message: err.res.data.message
      });

    })
};

export default placeOrder;