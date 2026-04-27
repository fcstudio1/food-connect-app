export default function About() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <h2 className="text-4xl font-extrabold text-[#2d4a1c] mb-6">About SF Food Connect</h2>
      <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
        <p>
          Students are an investment in the future. As a by-student, for-student organization, 
          SF Food Connect strives to address the barriers of food insecurity in Bay Area college students.
        </p>
        <p>
          Food insecurity disproportionally affects college students, anchored by high costs of living, 
          food deserts, and fragmented support systems. Our work focuses on helping students 
          navigate these barriers while rethinking how campuses respond.
        </p>
        <h3 className="text-2xl font-bold text-slate-800">Our Approach</h3>
        <p>
          Our model brings together student programming, educational workshops, and a campus-community 
          food access hub. We believe meaningful change requires partnerships across 
          community colleges and public health groups.
        </p>
        <blockquote className="border-l-4 border-green-500 pl-4 italic text-slate-700">
          "At its core, SF Food Connect is about dignity, access, and student well-being."
        </blockquote>
      </div>
    </div>
  );
}