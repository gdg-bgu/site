import { useEffect, useState } from "react";


function App() {
  const [time, setTime] = useState(Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(Date());
    }, 1000);

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  return (
    <>
      <h1 className="text-3xl font-bold">Hello from GDG BGU</h1>
      <p>
        Our site is still in development. You can check out our community page{" "}
        <a href="https://gdg.community.dev/gdg-on-campus-birla-global-university-bhubaneswar-india/" className="text-blue-700 underline">
          GDG on Campus BGU
        </a>
      </p>
      <p>
        You can track the development of this site{" "}
        <a href="https://github.com/gdg-bgu" className="text-blue-700 underline">GDG BGU's GitHub</a>
      </p>
      <p className="underline mt-5">{time}</p>
    </>
  );
}

export default App;

