import { PrismaClient, Ownership, ExamType, Category, Gender } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const colleges = [
  { name: "Indian Institute of Technology Delhi", slug: "iit-delhi", city: "New Delhi", state: "Delhi", ownership: Ownership.GOVERNMENT, fees: 250000, hostelFees: 45000, avgPackage: 22.5, highestPackage: 2.0, rating: 4.9, accreditation: "NAAC A++", nirfRank: 2, description: "IIT Delhi is one of India's premier engineering institutes, known for cutting-edge research and exceptional placements.", established: 1961, website: "https://home.iitd.ac.in" },
  { name: "Indian Institute of Technology Bombay", slug: "iit-bombay", city: "Mumbai", state: "Maharashtra", ownership: Ownership.GOVERNMENT, fees: 248000, hostelFees: 42000, avgPackage: 23.0, highestPackage: 3.67, rating: 4.9, accreditation: "NAAC A++", nirfRank: 3, description: "IIT Bombay excels in engineering education with strong industry connections and world-class faculty.", established: 1958, website: "https://www.iitb.ac.in" },
  { name: "Indian Institute of Technology Madras", slug: "iit-madras", city: "Chennai", state: "Tamil Nadu", ownership: Ownership.GOVERNMENT, fees: 245000, hostelFees: 40000, avgPackage: 21.8, highestPackage: 2.5, rating: 4.8, accreditation: "NAAC A++", nirfRank: 1, description: "IIT Madras leads NIRF rankings with outstanding research output and startup ecosystem.", established: 1959, website: "https://www.iitm.ac.in" },
  { name: "National Institute of Technology Trichy", slug: "nit-trichy", city: "Tiruchirappalli", state: "Tamil Nadu", ownership: Ownership.GOVERNMENT, fees: 175000, hostelFees: 35000, avgPackage: 18.5, highestPackage: 1.2, rating: 4.6, accreditation: "NAAC A+", nirfRank: 9, description: "NIT Trichy is the top NIT offering excellent placements and strong academic programs.", established: 1964, website: "https://www.nitt.edu" },
  { name: "Birla Institute of Technology and Science Pilani", slug: "bits-pilani", city: "Pilani", state: "Rajasthan", ownership: Ownership.PRIVATE, fees: 450000, hostelFees: 60000, avgPackage: 16.2, highestPackage: 1.5, rating: 4.7, accreditation: "NAAC A", nirfRank: 25, description: "BITS Pilani is a premier private institute with flexible academic structure and strong industry ties.", established: 1964, website: "https://www.bits-pilani.ac.in" },
  { name: "Delhi Technological University", slug: "dtu-delhi", city: "New Delhi", state: "Delhi", ownership: Ownership.GOVERNMENT, fees: 180000, hostelFees: 30000, avgPackage: 12.5, highestPackage: 0.8, rating: 4.3, accreditation: "NAAC A", nirfRank: 45, description: "DTU offers quality engineering education with affordable fees and good placement records.", established: 1941, website: "https://dtu.ac.in" },
  { name: "Vellore Institute of Technology", slug: "vit-vellore", city: "Vellore", state: "Tamil Nadu", ownership: Ownership.PRIVATE, fees: 380000, hostelFees: 55000, avgPackage: 8.5, highestPackage: 0.75, rating: 4.2, accreditation: "NAAC A++", nirfRank: 16, description: "VIT Vellore is a leading private university with diverse programs and global exposure.", established: 1984, website: "https://vit.ac.in" },
  { name: "Manipal Institute of Technology", slug: "mit-manipal", city: "Manipal", state: "Karnataka", ownership: Ownership.PRIVATE, fees: 420000, hostelFees: 65000, avgPackage: 9.2, highestPackage: 0.65, rating: 4.1, accreditation: "NAAC A++", nirfRank: 55, description: "MIT Manipal provides comprehensive engineering education with modern campus facilities.", established: 1957, website: "https://manipal.edu" },
  { name: "Indian Institute of Information Technology Allahabad", slug: "iiit-allahabad", city: "Prayagraj", state: "Uttar Pradesh", ownership: Ownership.GOVERNMENT, fees: 200000, hostelFees: 32000, avgPackage: 15.8, highestPackage: 0.9, rating: 4.5, accreditation: "NAAC A", nirfRank: 35, description: "IIIT Allahabad specializes in IT and CSE with strong coding culture and placements.", established: 1999, website: "https://iiita.ac.in" },
  { name: "Thapar Institute of Engineering and Technology", slug: "thapar-patiala", city: "Patiala", state: "Punjab", ownership: Ownership.PRIVATE, fees: 350000, hostelFees: 50000, avgPackage: 11.0, highestPackage: 0.7, rating: 4.3, accreditation: "NAAC A+", nirfRank: 48, description: "Thapar Institute offers robust engineering programs with consistent placement performance.", established: 1956, website: "https://www.thapar.edu" },
];

async function main() {
  console.log("Seeding CollegeIQ database...");

  const passwordHash = await bcrypt.hash("password123", 12);
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@collegeiq.in" },
    update: {},
    create: { name: "Demo Student", email: "demo@collegeiq.in", passwordHash },
  });

  for (const c of colleges) {
    const college = await prisma.college.upsert({
      where: { slug: c.slug },
      update: {},
      create: { ...c, logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name.split(" ").slice(0, 2).join("+"))}&background=6366f1&color=fff&size=128` },
    });

    await prisma.course.deleteMany({ where: { collegeId: college.id } });
    await prisma.course.createMany({
      data: [
        { collegeId: college.id, name: "Computer Science and Engineering", degree: "B.Tech", duration: "4 years", fees: c.fees, seats: 120, eligibility: "JEE Main / JEE Advanced" },
        { collegeId: college.id, name: "Electronics and Communication", degree: "B.Tech", duration: "4 years", fees: c.fees, seats: 90, eligibility: "JEE Main / JEE Advanced" },
        { collegeId: college.id, name: "Mechanical Engineering", degree: "B.Tech", duration: "4 years", fees: c.fees - 10000, seats: 60, eligibility: "JEE Main" },
      ],
    });

    await prisma.placement.deleteMany({ where: { collegeId: college.id } });
    await prisma.placement.create({
      data: { collegeId: college.id, year: 2024, avgPackage: c.avgPackage, highestPackage: c.highestPackage, medianPackage: c.avgPackage * 0.85, placementRate: 85 + Math.random() * 10, topRecruiters: ["Google", "Microsoft", "Amazon", "TCS", "Infosys"] },
    });

    await prisma.facility.deleteMany({ where: { collegeId: college.id } });
    await prisma.facility.createMany({
      data: [
        { collegeId: college.id, name: "Central Library", category: "Academic", available: true },
        { collegeId: college.id, name: "Sports Complex", category: "Sports", available: true },
        { collegeId: college.id, name: "Hostel", category: "Residential", available: true },
        { collegeId: college.id, name: "Wi-Fi Campus", category: "Infrastructure", available: true },
        { collegeId: college.id, name: "Research Labs", category: "Academic", available: c.nirfRank <= 20 },
      ],
    });

    await prisma.admission.deleteMany({ where: { collegeId: college.id } });
    await prisma.admission.create({
      data: {
        collegeId: college.id, exam: c.nirfRank <= 10 ? "JEE Advanced" : "JEE Main",
        process: "Online counseling through JoSAA/CSAB based on JEE rank.",
        eligibility: "10+2 with Physics, Chemistry, Mathematics. Minimum 75% aggregate.",
        seatMatrix: { CSE: 120, ECE: 90, ME: 60 },
      },
    });

    const baseRank = c.nirfRank * 500;
    await prisma.cutoff.deleteMany({ where: { collegeId: college.id } });
    for (const category of [Category.GENERAL, Category.OBC, Category.SC]) {
      const multiplier = category === Category.GENERAL ? 1 : category === Category.OBC ? 1.3 : 2;
      await prisma.cutoff.createMany({
        data: [
          { collegeId: college.id, exam: ExamType.JEE_MAIN, category, gender: Gender.MALE, homeState: c.state, year: 2024, openingRank: Math.round(baseRank * multiplier * 0.8), closingRank: Math.round(baseRank * multiplier), course: "Computer Science and Engineering" },
          { collegeId: college.id, exam: ExamType.JOSAA, category, gender: Gender.MALE, homeState: c.state, year: 2024, openingRank: Math.round(baseRank * multiplier * 0.7), closingRank: Math.round(baseRank * multiplier * 0.95), course: "Computer Science and Engineering" },
          { collegeId: college.id, exam: ExamType.CSAB, category, gender: Gender.MALE, homeState: c.state, year: 2024, openingRank: Math.round(baseRank * multiplier), closingRank: Math.round(baseRank * multiplier * 1.2), course: "Computer Science and Engineering" },
        ],
      });
    }

    await prisma.review.deleteMany({ where: { collegeId: college.id } });
    await prisma.review.create({
      data: { collegeId: college.id, userId: demoUser.id, rating: c.rating, title: "Great institute", content: `${c.name} offers excellent academic environment and placement opportunities. Highly recommended for serious engineering aspirants.` },
    });
  }

  console.log(`Seeded ${colleges.length} colleges`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
