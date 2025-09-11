// Function to find a user's group based on their email
export const findUserGroup = (email) => {
  if (!email) return null;
  
  return groups.find(group => 
    group.members.some(member => 
      member.email.toLowerCase() === email.toLowerCase()
    )
  );
};

// Helper function to get groupId and members by email
export const findUserGroupByEmail = (email) => {
  if (!email) return { groupId: null, members: [] };
  const e = String(email).toLowerCase();
  const g = groups.find(g =>
    g.members.some(m => String(m.email).toLowerCase() === e)
  );
  return { groupId: g?.groupID ?? null, members: g?.members ?? [] };
};

export const groups = [
{
  groupID: 1,
  members: [
      { role: "Mentee", name: "Kaitlyn Tang", email: "kntang@emory.edu", groupID: 1 },
      { role: "Mentee", name: "Christine Nam", email: "cnam7@emory.edu", groupID: 1 },
      { role: "Mentor", name: "Rachel Liu", email: "rhliu@emory.edu", groupID: 1 },
      { role: "Mentor", name: "Chu Huang", email: "chua277@emory.edu", groupID: 1 }
  ]
},

{
  groupID: 2,
  members: [
      { role: "Mentee", name: "Susie Warner", email: "susie.warner@emory.edu", groupID: 2 },
      { role: "Mentee", name: "Jaime Wu", email: "jaime.wu@emory.edu", groupID: 2 },
      { role: "Mentor", name: "Sarah You", email: "syou35@emory.edu", groupID: 2 },
      { role: "Mentor", name: "Yena Kang", email: "yena.kang@emory.edu", groupID: 2 }
  ]
},

{
  groupID: 3,
  members: [
      { role: "Mentee", name: "Alexis Nguyen", email: "alexis.nguyen@emory.edu", groupID: 3 },
      { role: "Mentee", name: "Joshua Flores", email: "jcflore@emory.edu", groupID: 3 },
      { role: "Mentor", name: "Helen Huang", email: "helen.huang@emory.edu", groupID: 3 },
      { role: "Mentor", name: "Hans Khoe", email: "hans.khoe@emory.edu", groupID: 3 }
  ]
},

{
  groupID: 4,
  members: [
      { role: "Mentee", name: "Daniel Chung", email: "jdchun3@emory.edu", groupID: 4 },
      { role: "Mentee", name: "Jenny Chen", email: "Jch2569@emory.edu", groupID: 4 },
      { role: "Mentor", name: "Rose Nguyen", email: "rose.nguyen@emory.edu", groupID: 4 },
      { role: "Mentor", name: "Vu Anh Nguyen", email: "vu-anh.nguyen@emory.edu", groupID: 4 }
  ]
},

{
  groupID: 5,
  members: [
      { role: "Mentee", name: "Nicole Seo", email: "sseo25@emory.edu", groupID: 5 },
      { role: "Mentee", name: "Sharon Mun", email: "sharon.mun@emory.edu", groupID: 5 },
      { role: "Mentor", name: "Kevin Yan", email: "", groupID: 5 },
      { role: "Mentor", name: "Han Gao", email: "han.gao@emory.edu", groupID: 5 }
  ]
},

{
  groupID: 6,
  members: [
      { role: "Mentee", name: "Angela Hahn", email: "sangjee.hahn@emory.edu", groupID: 6 },
      { role: "Mentee", name: "Justin Ryu", email: "jryu49@emory.edu", groupID: 6 },
      { role: "Mentor", name: "SK Rana", email: "rkhan27@emory.edu", groupID: 6 },
      { role: "Mentor", name: "Daniel Jo", email: "hjo34@emory.edu", groupID: 6 }
  ]
},

{
  groupID: 7,
  members: [
      { role: "Mentee", name: "Daniel Choi", email: "daniel.choi2310@gmail.com", groupID: 7 },
      { role: "Mentee", name: "yoon choi", email: "ga.yoon.choi@emory.edu", groupID: 7 },
      { role: "Mentor", name: "Ky Nguyen (Oscar Pham)", email: "", groupID: 7 },
      { role: "Mentor", name: "Kyle Sung", email: "kyle.sung@emory.edu", groupID: 7 }
  ]
},

{
  groupID: 8,
  members: [
      { role: "Mentee", name: "Kent Tran", email: "kent.tran@emory.edu", groupID: 8 },
      { role: "Mentee", name: "Sophie Lin", email: "slin83@emory.edu", groupID: 8 },
      { role: "Mentor", name: "Emma Barnes", email: "emma.barnes@emory.edu", groupID: 8 },
      { role: "Mentor", name: "Grace Choi", email: "grace.choi@emory.edu", groupID: 8 }
  ]
},

{
  groupID: 9,
  members: [
      { role: "Mentee", name: "Kyungkeuk Kim", email: "kyungkeuk.kim@emory.edu", groupID: 9 },
      { role: "Mentee", name: "Katherine Wang", email: "katherine.wang@emory.edu", groupID: 9 },
      { role: "Mentor", name: "Ann Yoon", email: "jyoo299@emory.edu", groupID: 9 },
      { role: "Mentor", name: "Kyunghee Moon", email: "kmun4@emory.edu", groupID: 9 }
  ]
},

{
  groupID: 10,
  members: [
      { role: "Mentee", name: "Kathy Wei", email: "kathy.wei@emory.edu", groupID: 10 },
      { role: "Mentee", name: "Moses Lim", email: "moses.lim@emory.edu", groupID: 10 },
      { role: "Mentor", name: "Elly Ren", email: "Elly.ren@emory.edu", groupID: 10 },
      { role: "Mentor", name: "Daniel Kim", email: "dkim726@emory.edu", groupID: 10 }
  ]
},

{
  groupID: 11,
  members: [
      { role: "Mentee", name: "Connor Liang", email: "connor.liang@emory.edu", groupID: 11 },
      { role: "Mentee", name: "Eugene Ahn", email: "eahn35@emory.edu", groupID: 11 },
      { role: "Mentor", name: "Eyoung Liu", email: "yliu992@emory.edu", groupID: 11 },
      { role: "Mentor", name: "Mingjie Lin", email: "mingjie.lin@emory.edu", groupID: 11 }
  ]
},

{
  groupID: 12,
  members: [
      { role: "Mentee", name: "Kyle Wang", email: "kyle.wang2@emory.edu", groupID: 12 },
      { role: "Mentee", name: "Eric Oh", email: "eric.oh@emory.edu", groupID: 12 },
      { role: "Mentor", name: "Austin Liu", email: "austin.liu@emory.edu", groupID: 12 },
      { role: "Mentor", name: "Jackie Deo", email: "jdeo@emory.edu", groupID: 12 }
  ]
},

{
  groupID: 13,
  members: [
      { role: "Mentee", name: "Heather Yang", email: "heather.yang@emory.edu", groupID: 13 },
      { role: "Mentee", name: "Lucy Chen", email: "lucy.chen@emory.edu", groupID: 13 },
      { role: "Mentor", name: "Yunseo Ki", email: "mki6@emory.edu", groupID: 13 },
      { role: "Mentor", name: "Rachel Lo", email: "rachel.lo@emory.edu", groupID: 13 }
  ]
},

{
  groupID: 14,
  members: [
      { role: "Mentee", name: "Quan Huyn", email: "Quan.huynh@emory.edu", groupID: 14 },
      { role: "Mentee", name: "Donald Yau", email: "dyau2@emory.edu", groupID: 14 },
      { role: "Mentor", name: "Sushanth Sunil", email: "ssunil3@emory.edu", groupID: 14 },
      { role: "Mentor", name: "Addison Huang", email: "addison.huang@emory.edu", groupID: 14 }
  ]
},
 {
    groupID: 15,
    members: [
      { role: "Mentee", name: "Daniel Choi", email: "iqra@gmail.com", groupID: 15 },
      { role: "Mentor", name: "Sarah You", email: "uneeb@gmail.com", groupID: 15 },
      { role: "Mentee", name: "Yena Kang", email: "fahad@gmail.com", groupID: 15 },
      { role: "Mentor", name: "Fahad ur Rehman", email: "fahadurrehman@gmail.com", groupID: 15 }
    ]
  },
   {
    groupID: 17,
    members: [
      { role: "Mentee", name: "Daniel Choi", email: "saad@gmail.com", groupID: 17 },
      { role: "Mentor", name: "Sarah You", email: "salaar@gmail.com", groupID: 17 },
    ]
  },
    {
    groupID: 18,
    members: [
      { role: "Mentee", name: "Daniel Choi", email: "saadd@gmail.com", groupID: 18 },
      { role: "Mentor", name: "Sarah You", email: "salaarr@gmail.com", groupID: 18 },
    ]
  },
];
