import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription, CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useState } from "react";
import axios from "axios";

export function SignUp() {
  const [ages, setAges] = useState<number[]>([20]);
  const [age, setAge] = useState<number>(20);
  const [response, setResponse] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [email, setEmail] = useState<string>('');

  const handleAges = (value: number[]) => {
    value.map((val) => (
      setAge(val)
    ))
    setAges(value)
  }

  const doSignUp = async () => {
    const baseUrl = 'https://localhost';
    const payload = {
      username: userName,
      email: email,
      password: password,
      age: age,
      firstName: firstName,
      lastName: lastName
    };
    const headers = {
      'Content-Type': 'application/json'
    };

    axios.post(`${baseUrl}/signup`, payload, { headers })
      .then((res) => {
        if (res.status === 200 && res.data) {
          if (!res.data.status) {
            setResponse(res.data.error.message);
          } else {
            console.log(res);
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
        <CardTitle className="text-xl">Sign Up</CardTitle>
        <CardDescription>
          Enter your information to create an account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                placeholder="Max"
                onChange={e => setFirstName(e.target.value)}
                required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                placeholder="Mustermann"
                onChange={e => setLastName(e.target.value)}
                required />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="MaxMustermann"
              onChange={e => setUserName(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="max.mustermann@gmail.com"
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              onChange={e => setPassword(e.target.value)}
              type="password"
            />
          </div>
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="steps">Age</Label>
                <Input
                  id="age"
                  className="w-12 px-2 py-0.5 text-center text-xs text-muted-foreground bg-transparent rounded border border-input"
                  type="number"
                  onChange={() => setAge(age)}
                  value={age}
                />
            </div>
            <Slider defaultValue={ages} min={18} max={99} step={1} onValueChange={handleAges} />
          </div>
          <Button
            className="w-full"
            onClick={doSignUp}>
            Create an account
          </Button>
        </div>
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <a href="/" className="underline">
            Sign in
          </a>
        </div>
      </CardContent>
      <CardFooter>
        <div className="w-full">
          {response && <p className="w-full text-center">{response}</p>}
        </div>
      </CardFooter>
    </Card>
  )
}
