"use client";

import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function HomePage() {
  const [teams, setTeams] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [images, setImages] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const teamsSnap = await getDocs(collection(db, "teams"));
    const fixturesSnap = await getDocs(collection(db, "fixtures"));
    const gallerySnap = await getDocs(collection(db, "gallery"));

    setTeams(teamsSnap.docs.map(doc => doc.data()));
    setFixtures(fixturesSnap.docs.map(doc => doc.data()));
    setImages(gallerySnap.docs.map(doc => doc.data()));
  }

  // 🔥 Top 5 teams
  const topTeams = [...teams]
    .sort((a, b) => (b.points ?? 0) - (a.points ?? 0))
    .slice(0, 5);

  return (
    <main className="min-h-screen bg-[#001f4d] text-white p-6">
      
      {/* 🏉 HERO */}
      <section className="text-center mt-10">
        <h1 className="text-4xl font-bold text-[#f5b800]">
          Madibaz Rugby League
        </h1>
        <p className="mt-3 text-gray-300">
          Fixtures • Results • Standings • Matchday Moments
        </p>
      </section>

      {/* 📊 TOP TEAMS */}
      <section className="mt-12 max-w-4xl mx-auto">
        <h2 className="text-xl font-bold text-[#f5b800] mb-4">
          Top Teams
        </h2>

        <div className="bg-[#0a1a33] p-4 rounded-xl border border-[#2e4a6b]">
          {topTeams.map((team, i) => (
            <div
              key={i}
              className="flex justify-between border-b border-[#2e4a6b] py-2"
            >
              <span>{i + 1}. {team.name}</span>
              <span className="text-[#f5b800] font-bold">
                {team.points ?? 0} pts
              </span>
            </div>
          ))}

          {topTeams.length === 0 && (
            <p className="text-gray-400 text-center">
              No teams yet.
            </p>
          )}
        </div>
      </section>

      {/* 📅 FIXTURES */}
      <section className="mt-12 max-w-4xl mx-auto">
        <h2 className="text-xl font-bold text-[#f5b800] mb-4">
          Upcoming Fixtures
        </h2>

        <div className="bg-[#0a1a33] p-4 rounded-xl border border-[#2e4a6b]">
          {fixtures.slice(0, 5).map((f, i) => (
            <div
              key={i}
              className="border-b border-[#2e4a6b] py-2"
            >
              {f.teamA} vs {f.teamB} — {f.date}
            </div>
          ))}

          {fixtures.length === 0 && (
            <p className="text-gray-400 text-center">
              No fixtures scheduled.
            </p>
          )}
        </div>
      </section>

      {/* 📸 GALLERY PREVIEW */}
      <section className="mt-12 max-w-5xl mx-auto">
        <h2 className="text-xl font-bold text-[#f5b800] mb-4">
          Latest Matchday Moments
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.slice(0, 8).map((img, i) => (
            <img
              key={i}
              src={img.imageUrl}
              className="rounded-lg border border-[#2e4a6b]"
            />
          ))}

          {images.length === 0 && (
            <p className="text-gray-400">
              No images uploaded yet.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}