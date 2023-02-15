import { Link } from 'react-router-dom';
import './Header.css';

export const Header = () => {
  return (
    <header className='Header'>
      <div>OpenAI Image with Crypto</div>
      <nav className='Nav'>
        <Link to='/'>Generate</Link>
        <Link to='/About'>About</Link>
        <a href='https://c4ei.net' target='_blank' > c4ei.net </a>
        <a href="https://vindax.com/?ref=5f62b1117c8f9cdaa8c895f8c8c631dc" target="_blank">BUY SAWON(ETH)</a>
        <a href="https://klayswap.com/exchange/swap?output=0x18814b01b5cc76f7043e10fd268cc4364df47da0" target="_blank">BUY CEIK</a>
        {/* <a
          href='https://huggingface.co/spaces/Gustavosta/MagicPrompt-Stable-Diffusion'
          target='_blank'
        >
          Enhance Prompts
        </a> */}
      </nav>
    </header>
  );
};
