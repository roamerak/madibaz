"use client";

import { startTransition, useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";

export default function FixturesPage() {
  const [teams, setTeams] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  const [date, setDate] = useState("");
  const [selectedFixture, setSelectedFixture] = useState(null);
  const [scoreA, setScoreA] = useState("");
  const [scoreB, setScoreB] = useState("");

  async function loadFixtures() {
    const snapshot = await getDocs(collection(db, "fixtures"));
    setFixtures(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
  }

  useEffect(() => {
    let isActive = true;

    async function fetchInitialData() {
      const [teamsSnapshot, fixturesSnapshot] = await Promise.all([
        getDocs(collection(db, "teams")),
        getDocs(collection(db, "fixtures")),
      ]);

      if (!isActive) return;

      startTransition(() => {
        setTeams(
          teamsSnapshot.docs.map((item) => ({ id: item.id, ...item.data() })),
        );
        setFixtures(
          fixturesSnapshot.docs.map((item) => ({
            id: item.id,
            ...item.data(),
          })),
        );
      });
    }

    void fetchInitialData();

    return () => {
      isActive = false;
    };
  }, []);

  async function addFixture() {
    if (!teamA || !teamB || teamA === teamB || !date) return;

    const selectedTeamA = teams.find((team) => team.id === teamA);
    const selectedTeamB = teams.find((team) => team.id === teamB);

    if (!selectedTeamA || !selectedTeamB) return;

    await addDoc(collection(db, "fixtures"), {
      teamA: selectedTeamA.name,
      teamB: selectedTeamB.name,
      date,
    });

    setTeamA("");
    setTeamB("");
    setDate("");

    await loadFixtures();
  }

  async function deleteFixture(id) {
    await deleteDoc(doc(db, "fixtures", id));
    await loadFixtures();
  }

  async function submitResult() {
    if (!selectedFixture) return;

    const a = Number(scoreA);
    const b = Number(scoreB);

    if (Number.isNaN(a) || Number.isNaN(b)) return;

    const snapshot = await getDocs(collection(db, "teams"));
    const teamsData = snapshot.docs.map((item) => ({
      id: item.id,
      ...item.data(),
    }));

    const selectedTeamA = teamsData.find(
      (team) => team.name === selectedFixture.teamA,
    );
    const selectedTeamB = teamsData.find(
      (team) => team.name === selectedFixture.teamB,
    );

    if (!selectedTeamA || !selectedTeamB) return;

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

    await deleteDoc(doc(db, "fixtures", selectedFixture.id));

    setSelectedFixture(null);
    setScoreA("");
    setScoreB("");

    await loadFixtures();
  }

  return (
    <main className="min-h-screen bg-[#001f4d] p-6 text-white">
      <h1 className="text-center text-3xl font-bold text-[#f5b800]">
        Fixtures
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
          type="date"
          onChange={(e) => setDate(e.target.value)}
          value={date}
          className="p-2 text-black"
        />

        <button
          className="rounded bg-[#f5b800] px-4 py-2 text-black"
          onClick={addFixture}
        >
          Add Fixture
        </button>
      </div>

      <div className="mx-auto mt-10 max-w-xl">
        {fixtures.map((fixture) => (
          <div
            key={fixture.id}
            className="mt-2 flex justify-between rounded bg-[#0a1a33] p-3"
          >
            <span>
              {fixture.teamA} vs {fixture.teamB} - {fixture.date}
            </span>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedFixture(fixture)}
                className="text-green-400"
              >
                Play
              </button>
              <button
                onClick={() => deleteFixture(fixture.id)}
                className="text-red-400"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedFixture && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70">
          <div className="w-80 rounded-lg bg-white p-6 text-black">
            <h2 className="mb-4 text-center font-bold">
              {selectedFixture.teamA} vs {selectedFixture.teamB}
            </h2>

            <input
              type="number"
              placeholder="Score A"
              value={scoreA}
              onChange={(e) => setScoreA(e.target.value)}
              className="mb-3 w-full border p-2"
            />

            <input
              type="number"
              placeholder="Score B"
              value={scoreB}
              onChange={(e) => setScoreB(e.target.value)}
              className="mb-4 w-full border p-2"
            />

            <div className="flex justify-between">
              <button onClick={() => setSelectedFixture(null)}>Cancel</button>
              <button
                onClick={submitResult}
                className="rounded bg-green-600 px-4 py-2 text-white"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
