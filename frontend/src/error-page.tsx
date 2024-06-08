import {isRouteErrorResponse, useRouteError} from 'react-router-dom'
import Error401 from "@/components/errors/401";
import Error404 from "@/components/errors/404";
import Error500 from "@/components/errors/500";
import Error503 from "@/components/errors/503";
import {useEffect} from "react";
import './styles/errors.css'

export default function ErrorPage() {
    const error = useRouteError()

    useEffect(() => {
        const body = window.document.body;
        body.classList.add('error')
    })

    if (isRouteErrorResponse(error)) {
        if (error.status === 404) {
            return <Error404 />;
        }

        if (error.status === 401) {
            return <Error401 />;
        }

        if (error.status === 503) {
            return <Error503 />;
        }
    }
    return <Error500 />;
}
