import React from 'react'

export default function DurationDate ({ className, miniseconds }) {
  return (
    <time dateTime={`P${Math.round(miniseconds)}S`} className={className}>
      {format(miniseconds)}
    </time>
  )
}

function format (miniseconds) {
  const date = new Date(miniseconds)
  const year = date.getFullYear()
  const month = pad(date.getMonth()+1)
  const dd  = pad(date.getDate())
  const hh = pad(date.getHours())
  const mm = pad(date.getMinutes())
  const ss = pad(date.getSeconds())
  
return `${year}/${pad(month)}/${pad(dd)} ${pad(hh)}:${pad(mm)}:${pad(ss)}`
}

function pad (string) {
  return ('0' + string).slice(-2)
}
