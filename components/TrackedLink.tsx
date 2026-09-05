'use client'

import Link from 'next/link'
import type { ComponentProps, MouseEvent } from 'react'
import {
  trackAnalyticsEvent,
  type AnalyticsEventName,
  type AnalyticsProperties,
} from '@/lib/analytics'

type TrackingProps = {
  eventName: AnalyticsEventName
  eventProperties?: AnalyticsProperties
}

type TrackedAnchorProps = ComponentProps<'a'> & TrackingProps

export function TrackedAnchor({
  eventName,
  eventProperties,
  onClick,
  ...props
}: TrackedAnchorProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)
    if (!event.defaultPrevented) {
      trackAnalyticsEvent(eventName, eventProperties)
    }
  }

  return <a {...props} onClick={handleClick} />
}

type TrackedInternalLinkProps = ComponentProps<typeof Link> & TrackingProps

export function TrackedInternalLink({
  eventName,
  eventProperties,
  onClick,
  ...props
}: TrackedInternalLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)
    if (!event.defaultPrevented) {
      trackAnalyticsEvent(eventName, eventProperties)
    }
  }

  return <Link {...props} onClick={handleClick} />
}
