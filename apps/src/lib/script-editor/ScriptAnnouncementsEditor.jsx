import React, { Component, PropTypes } from 'react';
import { announcementShape } from '@cdo/apps/code-studio/scriptAnnouncementsRedux';
import ScriptAnnouncements from '@cdo/apps/code-studio/components/progress/ScriptAnnouncements';
import { NotificationType } from '@cdo/apps/templates/Notification';

const styles = {
  announcement: {
    border: '1px solid #ccc',
    padding: 5,
    marginBottom: 10,
  },
  preview: {
    marginTop: 10
  }
};

const Announce = ({announcement, inputStyle, index, onChange, onRemove}) => (
  <div style={styles.announcement}>
    <h5>Announcement #{index + 1}</h5>
    <label>
      Notice
      <input
        value={announcement.notice}
        style={inputStyle}
        onChange={event => onChange(index, 'notice', event.target.value)}
      />
    </label>
    <label>
      Details
      <input
        value={announcement.details}
        style={inputStyle}
        onChange={event => onChange(index, 'details', event.target.value)}
      />
    </label>
    <label>
      Link
      <input
        value={announcement.link}
        style={inputStyle}
        onChange={event => onChange(index, 'link', event.target.value)}
      />
    </label>
    <label>
      Type
      <div>
        <select
          value={announcement.type}
          onChange={event => onChange(index, 'type', event.target.value)}
        >
          {Object.values(NotificationType).map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
    </label>
    <button
      className="btn"
      onClick={() => onRemove(index)}
    >
      Remove
    </button>
  </div>
);
Announce.propTypes = {
  announcement: announcementShape,
  inputStyle: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  onRemove: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default class ScriptAnnouncementsEditor extends Component {
  static propTypes = {
    announcements: PropTypes.arrayOf(announcementShape),
    inputStyle: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      announcements: props.announcements
    };
  }

  add = () => {
    this.setState({
      announcements: this.state.announcements.concat({
        notice: '',
        details: '',
        link: '',
        type: NotificationType.information
      })
    });
  }

  remove = (index) => {
    const newAnnouncements = [...this.state.announcements];
    newAnnouncements.splice(index, 1);
    this.setState({
      announcements: newAnnouncements
    });
  }

  change = (index, field, newValue) => {
    const newAnnouncements = [...this.state.announcements];
    newAnnouncements[index][field] = newValue;
    this.setState({
      announcements: newAnnouncements
    });
  }

  render() {
    const { inputStyle } = this.props;
    const { announcements } = this.state;
    return (
      <div>
        <input
          type="hidden"
          name="script_announcements"
          value={JSON.stringify(announcements)}
        />
        <h4>Script Announcements</h4>
        <div>
          This can be used to provide one or more announcements that will show
          up for signed in teachers on the script overview page.
        </div>
        {announcements.map((announce, index) => (
          <Announce
            key={index}
            index={index}
            announcement={announce}
            inputStyle={inputStyle}
            onChange={this.change}
            onRemove={this.remove}
          />
        ))}
        <button
          className="btn"
          onClick={this.add}
        >
          Additional Announcement
        </button>
        {announcements.length > 0 &&
          <div style={styles.preview}>
            <div>Preview:</div>
            <ScriptAnnouncements announcements={announcements}/>
          </div>
        }
      </div>
    );
  }
}
