'use client';

import Link from 'next/link';
import Button from '@mui/material/Button';

export default function NavigationButton(props) {
  return <Button component={Link} {...props} />;
}
