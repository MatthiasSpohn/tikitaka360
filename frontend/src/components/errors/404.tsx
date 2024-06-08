import {useRouteError} from "react-router-dom";
import ErrMessage from "@/components/errors/error-message";

export default function Error404() {
  const error = useRouteError()

  return (
    <div id="error-page">
      <div className="mars"></div>
      <ErrMessage error={error} />
      <div className="centered">
        <a className="btn-back" href="/">
          Back to previous page
        </a>
      </div>
      <img src="/assets/images/error/astronaut.svg" className="astronaut" />
      <img src="/assets/images/error/spaceship.svg" className="spaceship" />
    </div>
  )
}
