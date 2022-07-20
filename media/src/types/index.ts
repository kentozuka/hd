interface MediaEvent {
  uuid: string;
  origins: string[]
}

interface MediaResult {
  title: string;
  protocol: string;
  host: string;
  origin: string;
  thumbnail?: string;
  created: string;
}
