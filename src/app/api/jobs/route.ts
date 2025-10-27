import jobsData from '../../../../db.json';

export function GET() {
  return Response.json(jobsData.jobs ?? []);
}
