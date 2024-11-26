import Swal from "sweetalert2";

import React from 'react'

const Toast = () => {
    const Toast =Swal.mixin({
        toast: true,
        position: 'top',
        showCancelButton: false,
        timer: 3000,
        timerProgressBar: true
    })
  return Toast
}

export default Toast
