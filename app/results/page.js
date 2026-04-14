"use client";

import { startTransition, useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { addDoc, collection, doc, getDocs, updateDoc } from "firebase/firestore";

export default function ResultsPage() {
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  const [scoreA, setScoreA] = useState("");
  const [scoreB, setScoreB] = useState("");

  async function fetchTeams() {
    const snapshot = await getDocs(collection(db, "teams"));
    return snapshot.docs.map((item) => ({
      id: item.id,
      ...item.data(),
    }));
  }

  async function fetchMatches() {
    const snapshot = await getDocs(collection(db, "matches"));
    return snapshot.docs.map((item) => item.data());
  }

  async function refreshPageData() {
    const [teamsData, matchesData] = await Promise.all([
      fetchTeams(),
      fetchMatches(),
    ]);

    setTeams(teamsData);
    setMatches(matchesData);
  }

  useEffect(() => {
    let isActive = true;

    async function fetchInitialData() {
      const [teamsData, matchesData] = await Promise.all([
        fetchTeams(),
        fetchMatches(),
      ]);

      if (!isActive) return;

      startTransition(() => {
        setTeams(teamsData);
        setMatches(matchesData);
      });
    }

    void fetchInitialData();

    return () => {
      isActive = false;
    };
  }, []);

  async function submitResult() {
    if (!teamA || !teamB || teamA === teamB) return;

    const selectedTeamA = teams.find((team) => team.id === teamA);
    const selectedTeamB = teams.find((team) => team.id === teamB);

    if (!selectedTeamA || !selectedTeamB) return;

    const a = Number(scoreA);
    const b = Number(scoreB);

    if (Number.isNaN(a) || Number.isNaN(b)) return;

    const existingMatches = await getDocs(collection(db, "matches"));
    const alreadyPlayed = existingMatches.docs.some((item) => {
      const match = item.data();
      return (
        (match.teamA === selectedTeamA.name && match.teamB === selectedTeamB.name) ||
        (match.teamA === selectedTeamB.name && match.teamB === selectedTeamA.name)
      );
    });

    if (alreadyPlayed) {
      alert("Match already recorded!");
      return;
    }

    await addDoc(collection(db, "matches"), {
      teamA: selectedTeamA.name,
      teamB: selectedTeamB.name,
      scoreA: a,
      scoreB: b,
      date: new Date().toISOString(),
    });

    await updateDoc(doc(db, "teams", selectedTeamA.id), {
      played: (selectedTeamA.played ?? 0) + 1,
      wins: (selectedTeamA.wins ?? 0) + (a > b ? 1 : 0),
      draws: (selectedTeamA.draws ?? 0) + (a === b ? 1 : 0),
      losses: (selectedTeamA.losses ?? 0) + (a < b ? 1 : 0),
      gf: (selectedTeamA.gf ?? 0) + a,
      ga: (selectedTeamA.ga ?? 0) + b,
      points: (selectedTeamA.points ?? 0) + (a > b ? 3 : a === b ? 1 : 0),
    });

    await updateDoc(doc(db, "teams", selectedTeamB.id), {
      played: (selectedTeamB.played ?? 0) + 1,
      wins: (selectedTeamB.wins ?? 0) + (b > a ? 1 : 0),
      draws: (selectedTeamB.draws ?? 0) + (a === b ? 1 : 0),
      losses: (selectedTeamB.losses ?? 0) + (b < a ? 1 : 0),
      gf: (selectedTeamB.gf ?? 0) + b,
      ga: (selectedTeamB.ga ?? 0) + a,
      points: (selectedTeamB.points ?? 0) + (b > a ? 3 : a === b ? 1 : 0),
    });

    alert("Result saved!");

    setScoreA("");
    setScoreB("");

    await refreshPageData();
  }

  return (
    <main className="min-h-screen bg-[#001f4d] p-6 text-white">
      <h1 className="text-center text-3xl font-bold text-[#f5b800]">
        Results
      </h1>

      <div className="mt-6 flex flex-col items-center gap-4">
        <select
          onChange={(e) => setTeamA(e.target.value)}
          value={teamA}
          className="p-2 text-black"
        >
          <option value="">Team A</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Score A"
          value={scoreA}
          onChange={(e) => setScoreA(e.target.value)}
          className="p-2 text-black"
        />

        <select
          onChange={(e) => setTeamB(e.target.value)}
          value={teamB}
          className="p-2 text-black"
        >
          <option value="">Team B</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Score B"
          value={scoreB}
          onChange={(e) => setScoreB(e.target.value)}
          className="p-2 text-black"
        />

        <button
          onClick={submitResult}
          className="rounded bg-[#f5b800] px-4 py-2 text-black"
        >
          Submit Result
        </button>
      </div>

      <div className="mx-auto mt-10 max-w-xl">
        <h2 className="mb-4 text-center text-xl font-bold text-[#f5b800]">
          Match History
        </h2>

        {matches.length === 0 ? (
          <p className="text-center text-gray-400">No matches recorded yet.</p>
        ) : (
          matches.map((match, index) => (
            <div
              key={`${match.teamA}-${match.teamB}-${match.date ?? index}`}
              className="mt-2 rounded border border-[#2e4a6b] bg-[#0a1a33] p-3 text-center"
            >
              {match.teamA} {match.scoreA} - {match.scoreB} {match.teamB}
            </div>
          ))
        )}
      </div>
    </main>
  );
}
