import { isRouteErrorResponse } from 'react-router-dom'

export default function ErrMessage({ error }: { error: unknown }) {
  const errorResult = {
    imgSrc: '',
    errTitle: 'Oh no!!',
    errSubTitle: "You're either misspelling the URL",
    errSubLine: '',
    status: 'logo-500',
  }

  if (isRouteErrorResponse(error)) {
    errorResult.imgSrc = '/assets/images/error/404.svg'
    errorResult.errTitle = 'Oh no!!'
    errorResult.errSubTitle = "You're either misspelling the URL"
    errorResult.errSubLine = "or requesting a page that's no longer here."
    errorResult.status = `logo-${error.status.toString()}`
  } else if (error instanceof Error) {
    errorResult.errSubTitle = error.message
  } else if (typeof error === 'string') {
    errorResult.errSubTitle = error
  }

  return (
    <>
      <img src={errorResult.imgSrc} className={errorResult.status} />
      <img src="/assets/images/error/meteor.svg" className="meteor" />
      <p className="title">{errorResult.errTitle}</p>
      <p className="subtitle">
        {errorResult.errSubTitle}
        <br />
        {errorResult.errSubLine}
      </p>
    </>
  )
}
