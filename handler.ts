import { APIGatewayProxyHandler } from 'aws-lambda';
import { parse } from 'querystring';
import { WebClient } from '@slack/web-api';
import * as moment from 'moment';

const token = process.env.SLACK_TOKEN;

const web = new WebClient(token);

export const hello: APIGatewayProxyHandler = async event => {
  const body = parse(event.body);

  const user = body.user_id as string;

  const now = moment().format('YYMMDDHHmmssSSSS');

  const result = await web.channels.create({ name: `tmp-${now}` });

  const channel = result.channel as Channel;

  if (user !== channel.members[0]) {
    await web.channels.leave({ channel: channel.id });
    await web.channels.invite({ channel: channel.id, user: user });
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      response_type: 'ephemeral',
      text: `<#${channel.id}>`
    })
  };
};

interface Channel {
  id: string;
  members: string[];
}
