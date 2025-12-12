let data = {
  data: "registration",
  title: "Name",
  render: () => {

    let displayName = "Unknown";

    let previousRegName = row.previousData?.registration?.name;
    let previousConferenceName = row.previousData?.conferenceCallParticipant?.callerDisplayName;
    let previousName = row.previousData?.name;

    let currentRegName = row.registration?.name;
    let currentConferenceName = row.conferenceCallParticipant?.callerDisplayName;
    let currentName = row.name;


    // check if name changed
    if (previousName !== currentName && currentName) {
      return `<a class="action-edit-profile" href="#" data-row-id="${row.userId}">${previousName}</a>`;
    }
    
    // check if conference name changed
    if (previousConferenceName !== currentConferenceName && currentConferenceName) {
      return `<a class="action-edit-profile" href="#" data-row-id="${row.userId}">${previousConferenceName}</a>`;
    }

    // check if registration name changed
    if (previousRegName !== currentRegName && currentRegName) {
      return `<a class="action-edit-profile" href="#" data-row-id="${row.userId}">${previousRegName}</a>`;
    }

    // registration name
    if(currentRegName) {
      return `<a class="action-edit-profile" href="#" data-row-id="${row.userId}">${currentRegName}</a>`;
    }

    // conference name
    if(currentConferenceName) {
      return `<a class="action-edit-profile" href="#" data-row-id="${row.userId}">${currentConferenceName}</a>`;
    }
    
    // regular name
    if(currentName) {
      return `<a class="action-edit-profile" href="#" data-row-id="${row.userId}">${currentName}</a>`;
    }

    return "Unknown";

    // if (regData) {
    //   return `<a class="action-edit-profile" href="#" data-row-id="${row.userId}">${regData.name}</a>`;
    // }
    // if (row.conferenceCallParticipant?.callerDisplayName) {
    //   return `<a class="action-edit-profile" href="#" data-row-id="${row.userId}">
    //       ${row.conferenceCallParticipant.callerDisplayName}
    //       </a>`;
    // }
    // if (row.name) {
    //   return `<a class="action-edit-profile" href="#" data-row-id="${row.userId}">${row.name}</a>`;
    // }

    // return "Unknown";
  },
};
