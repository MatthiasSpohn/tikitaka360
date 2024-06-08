export default function Error401() {
  const errorResult = {
    imgSrc: '/assets/images/error/401.svg',
    errTitle: 'Oh no!!',
    errSubTitle: "You aren't authorized to see this",
    errSubLine: '',
    status: 'logo-401',
  }

  return (
    <div id="error-page">
      <div className="mars"></div>
      <img src={errorResult.imgSrc} className={errorResult.status}/>
      <img src="/assets/images/error/meteor.svg" className="meteor"/>
      <p className="title">{errorResult.errTitle}</p>
      <p className="subtitle">
        {errorResult.errSubTitle}
        <br/>
        {errorResult.errSubLine}
      </p>
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
