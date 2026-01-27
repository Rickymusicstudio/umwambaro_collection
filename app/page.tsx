import { supabase } from "../lib/supabaseClient";

export default async function Home() {
  const { data } = await supabase.from("test").select("*");

  return (
    <div className="p-10 text-xl">
      Supabase Connected ✅
    </div>
  );
}
