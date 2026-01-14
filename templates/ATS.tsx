import { ParsedResumeData } from '../lib/resumeParser'

interface ATSResumeProps {
  data: ParsedResumeData
}

export default function ATSResume({ data }: ATSResumeProps) {
  return (
    <div className="font-sans text-sm leading-relaxed p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b-2 border-gray-800 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">
          {data.basics.name}
        </h1>
        <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-700">
          {data.basics.email && (
            <span>📧 {data.basics.email}</span>
          )}
          {data.basics.phone && (
            <span>📞 {data.basics.phone}</span>
          )}
          {data.basics.location && (
            <span>📍 {data.basics.location}</span>
          )}
          {data.basics.linkedin && (
            <span>🔗 {data.basics.linkedin}</span>
          )}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <section className="mb-6">
          <h2 className="font-bold text-lg uppercase border-b border-gray-300 pb-1 mb-3">
            Professional Summary
          </h2>
          <p className="text-gray-800 leading-relaxed">
            {data.summary}
          </p>
        </section>
      )}

      {/* Skills */}
      {data.skills && data.skills.length > 0 && (
        <section className="mb-6">
          <h2 className="font-bold text-lg uppercase border-b border-gray-300 pb-1 mb-3">
            Core Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, index) => (
              <span 
                key={index} 
                className="bg-gray-100 px-3 py-1 rounded text-sm font-medium text-gray-700"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <section className="mb-6">
          <h2 className="font-bold text-lg uppercase border-b border-gray-300 pb-1 mb-3">
            Professional Experience
          </h2>
          <div className="space-y-4">
            {data.experience.map((exp, index) => (
              <div key={index} className="border-l-2 border-gray-300 pl-4">
                <div className="flex flex-wrap justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-900">{exp.title}</h3>
                  <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    {exp.duration}
                  </span>
                </div>
                <p className="font-semibold text-gray-800 mb-2">{exp.company}</p>
                <ul className="space-y-1">
                  {exp.bullets.map((bullet, bulletIndex) => (
                    <li key={bulletIndex} className="flex items-start">
                      <span className="text-gray-600 mr-2">•</span>
                      <span className="text-gray-700">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <section className="mb-6">
          <h2 className="font-bold text-lg uppercase border-b border-gray-300 pb-1 mb-3">
            Education
          </h2>
          <div className="space-y-3">
            {data.education.map((edu, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                  <p className="text-gray-700">{edu.institution}</p>
                </div>
                {edu.year && (
                  <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    {edu.year}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications */}
      {data.certifications && data.certifications.length > 0 && (
        <section className="mb-6">
          <h2 className="font-bold text-lg uppercase border-b border-gray-300 pb-1 mb-3">
            Certifications
          </h2>
          <div className="space-y-2">
            {data.certifications.map((cert, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="font-medium text-gray-800">{cert.name}</span>
                <span className="text-sm text-gray-600">
                  {cert.issuer}{cert.date ? ` (${cert.date})` : ''}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <section className="mb-6">
          <h2 className="font-bold text-lg uppercase border-b border-gray-300 pb-1 mb-3">
            Projects
          </h2>
          <div className="space-y-3">
            {data.projects.map((project, index) => (
              <div key={index}>
                <h3 className="font-semibold text-gray-900">{project.name}</h3>
                <p className="text-gray-700 mb-2">{project.description}</p>
                {project.technologies && project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, techIndex) => (
                      <span 
                        key={techIndex} 
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}