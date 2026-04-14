"use client";

import { useEffect, useState, startTransition } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { db } from "../../lib/firebase";

function PoolTable({ title, data, onDelete }) {
  return (
    <div className="mt-8 rounded-xl border-2 border-[#2e4a6b] bg-[#0a1a33] p-4">
      <h2 className="mb-3 text-center text-lg font-bold text-[#f5b800]">
        {title}
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-white">
          <thead className="bg-[#001f4d]">
            <tr>
              <th className="p-2">#</th>
              <th className="p-2 text-left">Team</th>
              <th className="p-2">PL</th>
              <th className="p-2">W</th>
              <th className="p-2">D</th>
              <th className="p-2">L</th>
              <th className="p-2">GF</th>
              <th className="p-2">GA</th>
              <th className="p-2">PTS</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>

          <tbody>
            {data.map((team, index) => (
              <tr key={team.id} className="border-b border-[#2e4a6b]">
                <td className="p-2 text-center">{index + 1}</td>
                <td className="p-2">{team.name}</td>
                <td className="p-2 text-center">{team.played ?? 0}</td>
                <td className="p-2 text-center">{team.wins ?? 0}</td>
                <td className="p-2 text-center">{team.draws ?? 0}</td>
                <td className="p-2 text-center">{team.losses ?? 0}</td>
                <td className="p-2 text-center">{team.gf ?? 0}</td>
                <td className="p-2 text-center">{team.ga ?? 0}</td>
                <td className="p-2 text-center font-bold text-[#f5b800]">
                  {team.points ?? 0}
                </td>
                <td className="p-2 text-center">
                  <button
                    onClick={() => onDelete(team)}
                    className="rounded bg-red-600 px-3 py-1 text-xs text-white"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {data.length === 0 && (
              <tr>
                <td colSpan={10} className="p-4 text-center text-gray-300">
                  No teams in this pool yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function LogPage() {
  // 🔐 ADMIN STATE
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState("");

  // 📊 DATA STATE
  const [teams, setTeams] = useState([]);
  const [teamName, setTeamName] = useState("");
  const [pool, setPool] = useState("A");
  const [busy, setBusy] = useState(false);

  // 🔐 LOGIN
  function handleLogin() {
    if (password === "roamerakrules123") {
      setIsAdmin(true);
    } else {
      alert("Wrong password");
    }
  }

  // 🔄 LOAD TEAMS
  async function refreshTeams() {
    const snapshot = await getDocs(collection(db, "teams"));
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    startTransition(() => {
      setTeams(data);
    });
  }

  useEffect(() => {
    refreshTeams();
  }, []);

  // ➕ ADD TEAM
  async function addTeam() {
    const trimmed = teamName.trim();
    if (!trimmed) return;

    const exists = teams.some(
      (t) => t.name.toLowerCase() === trimmed.toLowerCase()
    );

    if (exists) {
      alert("Team already exists");
      return;
    }

    setBusy(true);

    await addDoc(collection(db, "teams"), {
      name: trimmed,
      pool,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      gf: 0,
      ga: 0,
      points: 0,
    });

    setTeamName("");
    await refreshTeams();
    setBusy(false);
  }

  // ❌ DELETE TEAM
  async function deleteTeam(team) {
    if (!confirm(`Delete ${team.name}?`)) return;

    setBusy(true);
    await deleteDoc(doc(db, "teams", team.id));
    await refreshTeams();
    setBusy(false);
  }

  // 🌱 SEED TEAMS
  async function seedTeams() {
    const snapshot = await getDocs(collection(db, "teams"));

    if (!snapshot.empty) {
      alert("Teams already exist");
      return;
    }

    const defaultTeams = [
      { name: "Smart", pool: "A" },
      { name: "Solomon Mahlangu", pool: "A" },
      { name: "Phase 3", pool: "A" },
      { name: "Lilian Ngoyi", pool: "A" },
      { name: "Alpha Students", pool: "A" },
      { name: "Charlotte Maxeke", pool: "A" },
      { name: "Yolanda Guma", pool: "A" },
      { name: "Kings", pool: "A" },
      { name: "Campus Key", pool: "A" },

      { name: "Castle House", pool: "B" },
      { name: "SSV All Star", pool: "B" },
      { name: "MetreRez", pool: "B" },
      { name: "PSA", pool: "B" },
      { name: "Sarah Baartman", pool: "B" },
      { name: "SSSV", pool: "B" },
      { name: "Laboria", pool: "B" },
      { name: "GQ Village", pool: "B" },
      { name: "Surburban Diggs", pool: "B" },
    ];

    setBusy(true);

    for (let team of defaultTeams) {
      await addDoc(collection(db, "teams"), {
        ...team,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        gf: 0,
        ga: 0,
        points: 0,
      });
    }

    await refreshTeams();
    setBusy(false);
    alert("Teams loaded!");
  }

  // 📊 SORT
  const sortTeams = (arr) =>
    [...arr].sort((a, b) => (b.points ?? 0) - (a.points ?? 0));

  const poolA = sortTeams(teams.filter((t) => t.pool === "A"));
  const poolB = sortTeams(teams.filter((t) => t.pool === "B"));

  // 🔐 LOGIN SCREEN
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#001f4d]">
        <div className="bg-[#0a1a33] p-6 rounded-lg text-center">
          <h2 className="text-[#f5b800] text-xl mb-4">Admin Login</h2>

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-2 text-black mb-4 w-full"
          />

          <button
            onClick={handleLogin}
            className="bg-[#f5b800] px-4 py-2 text-black rounded"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  // 🔓 ADMIN VIEW
  return (
    <main className="min-h-screen bg-[#001f4d] p-6 text-white">
      <h1 className="text-center text-3xl font-bold text-[#f5b800]">
        League Log
      </h1>

      {/* ADD TEAM */}
      <div className="mx-auto mt-6 max-w-4xl rounded-xl bg-[#0a1a33] p-5 border border-[#2e4a6b]">
        <div className="flex flex-col md:flex-row gap-3">
          <input
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Team name"
            className="p-2 rounded text-black flex-1"
          />

          <select
            value={pool}
            onChange={(e) => setPool(e.target.value)}
            className="p-2 rounded text-black"
          >
            <option value="A">Pool A</option>
            <option value="B">Pool B</option>
          </select>

          <button
            onClick={addTeam}
            disabled={busy}
            className="bg-[#f5b800] text-black px-4 py-2 rounded"
          >
            Add
          </button>
        </div>
      </div>

      {/* SEED BUTTON */}
      {teams.length === 0 && (
        <div className="text-center mt-6">
          <button
            onClick={seedTeams}
            className="bg-[#f5b800] text-black px-4 py-2 rounded"
          >
            Load Default Teams
          </button>
        </div>
      )}

      {/* TABLES */}
      <PoolTable title="Pool A" data={poolA} onDelete={deleteTeam} />
      <PoolTable title="Pool B" data={poolB} onDelete={deleteTeam} />
    </main>
  );
}