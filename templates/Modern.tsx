import { ParsedResumeData } from '../lib/resumeParser'

interface ModernResumeProps {
  data: ParsedResumeData
}

export default function ModernResume({ data }: ModernResumeProps) {
  return (
    <div className="grid grid-cols-3 gap-8 p-8 max-w-6xl mx-auto font-sans">
      {/* Left Column - Contact & Skills */}
      <div className="col-span-1 space-y-6">
        {/* Profile Section */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">{data.basics.name}</h1>
          <div className="space-y-2 text-sm opacity-90">
            {data.basics.email && (
              <p>📧 {data.basics.email}</p>
            )}
            {data.basics.phone && (
              <p>📞 {data.basics.phone}</p>
            )}
            {data.basics.location && (
              <p>📍 {data.basics.location}</p>
            )}
            {data.basics.linkedin && (
              <p>🔗 {data.basics.linkedin}</p>
            )}
          </div>
        </div>

        {/* Skills Section */}
        {data.skills && data.skills.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-5">
            <h2 className="font-bold text-lg text-gray-800 mb-4 pb-2 border-b-2 border-blue-500">
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, index) => (
                <span 
                  key={index} 
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Education Sidebar */}
        {data.education && data.education.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-5">
            <h2 className="font-bold text-lg text-gray-800 mb-4 pb-2 border-b-2 border-purple-500">
              Education
            </h2>
            <div className="space-y-3">
              {data.education.map((edu, index) => (
                <div key={index}>
                  <h3 className="font-semibold text-gray-800">{edu.degree}</h3>
                  <p className="text-gray-600 text-sm">{edu.institution}</p>
                  {edu.year && (
                    <p className="text-gray-500 text-xs mt-1">{edu.year}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {data.certifications && data.certifications.length > 0 && (
          <div className="bg-gray-50 rounded-xl p-5">
            <h2 className="font-bold text-lg text-gray-800 mb-4 pb-2 border-b-2 border-green-500">
              Certifications
            </h2>
            <div className="space-y-2">
              {data.certifications.map((cert, index) => (
                <div key={index} className="text-sm">
                  <p className="font-medium text-gray-800">{cert.name}</p>
                  <p className="text-gray-600">{cert.issuer}</p>
                  {cert.date && (
                    <p className="text-gray-500 text-xs">{cert.date}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Column - Main Content */}
      <div className="col-span-2 space-y-8">
        {/* Summary */}
        {data.summary && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-xl text-gray-800 mb-4 pb-2 border-b-2 border-blue-500">
              Professional Summary
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {data.summary}
            </p>
          </div>
        )}

        {/* Experience */}
        {data.experience && data.experience.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-xl text-gray-800 mb-6 pb-2 border-b-2 border-purple-500">
              Work Experience
            </h2>
            <div className="space-y-6">
              {data.experience.map((exp, index) => (
                <div key={index} className="relative pl-6 border-l-2 border-blue-200">
                  <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-500 rounded-full"></div>
                  <div className="flex flex-wrap justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{exp.title}</h3>
                      <p className="font-semibold text-blue-600">{exp.company}</p>
                    </div>
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                      {exp.duration}
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {exp.bullets.map((bullet, bulletIndex) => (
                      <li key={bulletIndex} className="flex items-start">
                        <span className="text-blue-500 mr-3 mt-1">•</span>
                        <span className="text-gray-700">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {data.projects && data.projects.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-bold text-xl text-gray-800 mb-6 pb-2 border-b-2 border-green-500">
              Projects
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {data.projects.map((project, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-bold text-gray-900 mb-2">{project.name}</h3>
                  <p className="text-gray-700 mb-3">{project.description}</p>
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech, techIndex) => (
                        <span 
                          key={techIndex} 
                          className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}