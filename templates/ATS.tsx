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
        <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-700">
          {data.basics.email && (
            <span>Email: {data.basics.email}</span>
          )}
          {data.basics.phone && (
            <span>Phone: {data.basics.phone}</span>
          )}
          {data.basics.location && (
            <span>Location: {data.basics.location}</span>
          )}
          {data.basics.linkedin && (
            <span>LinkedIn: {data.basics.linkedin}</span>
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
        <section className="mb-6 break-inside-avoid">
          <h2 className="font-bold text-lg uppercase pb-1 mb-3">
            Core Skills
          </h2>
          <p className="text-gray-800">
            {data.skills.join(', ')}
          </p>
        </section>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <section className="mb-6 break-inside-avoid">
          <h2 className="font-bold text-lg uppercase pb-1 mb-3">
            Professional Experience
          </h2>
          <div className="space-y-4">
            {data.experience.map((exp, index) => (
              <div key={index} className="pl-0">
                <div className="flex flex-wrap justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-900">{exp.title}</h3>
                  <span className="text-sm text-gray-600">
                    {exp.duration}
                  </span>
                </div>
                <p className="font-semibold text-gray-800 mb-2">{exp.company}</p>
                <ul className="space-y-1">
                  {exp.bullets.map((bullet, bulletIndex) => (
                    <li key={bulletIndex} className="flex items-start">
                      <span className="text-gray-600 mr-2">-</span>
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
        <section className="mb-6 break-inside-avoid">
          <h2 className="font-bold text-lg uppercase pb-1 mb-3">
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
                  <span className="text-sm text-gray-600">
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
        <section className="mb-6 break-inside-avoid">
          <h2 className="font-bold text-lg uppercase pb-1 mb-3">
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
        <section className="mb-6 break-inside-avoid">
          <h2 className="font-bold text-lg uppercase pb-1 mb-3">
            Projects
          </h2>
          <div className="space-y-3">
            {data.projects.map((project, index) => (
              <div key={index}>
                <h3 className="font-semibold text-gray-900">{project.name}</h3>
                <p className="text-gray-700 mb-2">{project.description}</p>
                {project.technologies && project.technologies.length > 0 && (
                  <p className="text-sm text-gray-600">
                    Technologies: {project.technologies.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}