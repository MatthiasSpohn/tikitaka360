import axios from "axios";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx"
import { Input } from "@/components/ui/input.tsx"
import { Label } from "@/components/ui/label.tsx"
import { useState } from "react";

export function LoginForm() {
  const [response, setResponse] = useState<string>('');
  const [username, setUserName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [authenticated, setAuthenticated] = useState<boolean>(false);

  const doLogin = async () => {
    const baseUrl = 'https://localhost';
    const credentials = { username: username, password: password };
    const headers = {
      'Content-Type': 'application/json'
    };

    axios.post(`${baseUrl}/login`, credentials, { headers })
      .then((res) => {
        if (res.status === 200 && res.data) {
          if (res.data.status) {
            const data = res.data.data;
            setResponse(`Welcome ${data.user.firstName} ${data.user.lastName}`);
            localStorage.setItem("accessToken", data.token);
            setAuthenticated(true);
          } else {
            setResponse(res.data.error.message);
          }
        }
      })
      .catch(error => {
        setResponse(error.message);
      });
  }

  return (
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter username and password below to login to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="MaxMustermann"
              onChange={e => setUserName(e.target.value)}
              required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required />
          </div>

          {!authenticated && <Button
            className="w-full"
            onClick={doLogin}>Sign in
          </Button>
          }

          {authenticated && <Button asChild className="w-full">
            <a href="/dashboard">Weiter</a>
          </Button>
          }

        </CardContent>
        <CardFooter>
          <div className="w-full">
            {response && <p className="w-full text-center">{response}</p>}
          </div>
        </CardFooter>
      </Card>
  )
}
