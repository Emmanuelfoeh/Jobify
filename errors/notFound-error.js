import CustomAPIError from "./customAPI-error.js";

class notFound extends CustomAPIError {
  constructor(message) {
    super(message);
    this.statusCode = 404;
  }
}

export default notFound;
